import pygame
import sys
import os
import math
import struct
import random

# ─────────────────────────────────────────────────────────────── constants ──
SCREEN_W      = 800
SCREEN_H      = 400
FPS           = 60
TITLE         = "Olé! – Lagos Runner"
GROUND_Y      = 320          # y-coordinate of the ground surface

PLAYER_W      = 32
PLAYER_H      = 32
DUCK_H        = 16
PLAYER_X      = 120
GRAVITY       = 0.7          # px / frame²
JUMP_VY       = -14.0        # initial upward velocity on jump

BASE_SPEED    = 5.0
MAX_SPEED     = 18.0
SPEED_SCALE   = 0.004        # speed added per point of score
SPAWN_HI_BASE = 120          # max gap between spawns at score 0 (frames)
SPAWN_LO_BASE = 45           # min gap between spawns at score 0 (frames)
SPAWN_SHRINK  = 0.05         # gap shrinks this much per point
MIN_SPAWN_GAP = 28           # absolute floor on spawn gap (frames)
HITBOX_SHRINK = 5            # pixels trimmed per side of collision rect

SAMPLE_RATE   = 44100

# ───────────────────────────────────────────────────────────────── colours ──
BLACK   = (  0,   0,   0)
WHITE   = (255, 255, 255)
GREY    = ( 80,  80,  80)
CYAN    = (  0, 255, 220)
YELLOW  = (255, 200,   0)
ORANGE  = (220, 110,  30)
RED     = (220,  50,  50)
SKIN    = (230, 185, 130)
SKYBLUE = ( 12,  12,  32)
BLDG_A  = ( 22,  22,  42)
BLDG_B  = ( 32,  28,  50)
WIN_LIT = (255, 240, 130)
WIN_DRK = ( 40,  40,  60)
ROAD    = ( 50,  50,  50)
DIM_W   = (180, 180, 180)

# ─────────────────────────────────────────────── obstacle type definitions ──
DANFO      = "danfo"
FOOD_STAND = "food_stand"
PEDESTRIAN = "pedestrian"

# w / h are (min, max) random ranges.
# y_off = pixels the obstacle's bottom sits above GROUND_Y (0 = ground level).
#
# Food-stand geometry: floats 20 px above ground so a ducking player (16 px
# tall, hitbox top = GROUND_Y-11) passes safely under it, while a standing
# player (hitbox top = GROUND_Y-27) is clipped by the overhang.
OBSTACLE_DEF = {
    DANFO:      {"w": (80, 100), "h": (65, 80), "y_off": 0,  "color": YELLOW},
    FOOD_STAND: {"w": (60, 80),  "h": (50, 58), "y_off": 20, "color": ORANGE},
    PEDESTRIAN: {"w": (20, 26),  "h": (42, 55), "y_off": 0,  "color": SKIN},
}

SCORE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "highscore.txt")


# ─────────────────────────────────────────────────────────── SoundEngine ──
class SoundEngine:
    """Generates short sine-wave tones using only pygame.mixer + struct."""

    def __init__(self):
        self._ok = True
        try:
            self._jump  = self._tone(520, 100, 0.22, 7.0)
            self._crash = self._tone(140, 320, 0.45, 3.5)
        except Exception:
            self._ok = False

    def _tone(self, freq: float, ms: int, vol: float, decay: float) -> pygame.mixer.Sound:
        n   = int(SAMPLE_RATE * ms / 1000)
        buf = bytearray(n * 4)          # 2 channels × 2 bytes each
        for i in range(n):
            t   = i / SAMPLE_RATE
            env = math.exp(-decay * t * (1000.0 / ms))
            v   = int(32767 * vol * env * math.sin(2 * math.pi * freq * t))
            v   = max(-32767, min(32767, v))
            struct.pack_into("<hh", buf, i * 4, v, v)   # left + right channel
        return pygame.mixer.Sound(buffer=bytes(buf))

    def play_jump(self):
        if self._ok:
            try: self._jump.play()
            except Exception: pass

    def play_crash(self):
        if self._ok:
            try: self._crash.play()
            except Exception: pass


# ────────────────────────────────────────────────────────── ScoreTracker ──
class ScoreTracker:
    def __init__(self):
        self.score = 0
        self.best  = self._load()

    def _load(self) -> int:
        try:
            with open(SCORE_FILE) as f:
                return int(f.read().strip())
        except (OSError, ValueError):
            return 0

    def save(self):
        try:
            with open(SCORE_FILE, "w") as f:
                f.write(str(self.best))
        except OSError:
            pass

    def on_death(self):
        if self.score > self.best:
            self.best = self.score
            self.save()


# ──────────────────────────────────────────────────────────────── Player ──
class Player:
    def __init__(self, sounds: SoundEngine):
        self._sounds   = sounds
        self.x         = PLAYER_X
        self.y         = float(GROUND_Y - PLAYER_H)   # top-left y of player rect
        self.vy        = 0.0
        self.on_ground = True
        self.ducking   = False
        self._sync()

    def _h(self) -> int:
        return DUCK_H if self.ducking else PLAYER_H

    def _sync(self):
        h           = self._h()
        self.rect   = pygame.Rect(self.x, GROUND_Y - h, PLAYER_W, h)
        self.hitbox = self.rect.inflate(-HITBOX_SHRINK * 2, -HITBOX_SHRINK * 2)

    def jump(self):
        if self.on_ground and not self.ducking:
            self.vy        = JUMP_VY
            self.on_ground = False
            self._sounds.play_jump()

    def set_duck(self, active: bool):
        """Only effective while on the ground; auto-clears on landing."""
        if not self.on_ground:
            return
        self.ducking = active
        self._sync()

    def update(self):
        if not self.on_ground:
            self.vy += GRAVITY
            self.y  += self.vy
            if self.y >= GROUND_Y - PLAYER_H:
                self.y         = float(GROUND_Y - PLAYER_H)
                self.vy        = 0.0
                self.on_ground = True
                self.ducking   = False
        self._sync()

    def draw(self, surf: pygame.Surface):
        h  = self._h()
        ry = GROUND_Y - h
        pygame.draw.rect(surf, CYAN,  (self.x, ry, PLAYER_W, h))
        pygame.draw.rect(surf, WHITE, (self.x, ry, PLAYER_W, h), 2)
        if not self.ducking:
            pygame.draw.rect(surf, WHITE, (self.x + PLAYER_W - 10, ry + 5, 5, 5))


# ─────────────────────────────────────────────────────────────── Obstacle ──
class Obstacle:
    def __init__(self, speed: float):
        self.kind  = random.choice(list(OBSTACLE_DEF))
        cfg        = OBSTACLE_DEF[self.kind]
        self.w     = random.randint(*cfg["w"])
        self.h     = random.randint(*cfg["h"])
        self.y_off = cfg["y_off"]
        self.color = cfg["color"]
        self.speed = speed
        self.x     = float(SCREEN_W + 4)
        self._sync()

    def _sync(self):
        ry          = GROUND_Y - self.y_off - self.h
        self.rect   = pygame.Rect(int(self.x), ry, self.w, self.h)
        self.hitbox = self.rect.inflate(-HITBOX_SHRINK * 2, -HITBOX_SHRINK * 2)

    def update(self):
        self.x -= self.speed
        self._sync()

    def off_screen(self) -> bool:
        return self.x + self.w < 0

    def draw(self, surf: pygame.Surface):
        pygame.draw.rect(surf, self.color, self.rect)
        pygame.draw.rect(surf, BLACK,      self.rect, 2)
        if   self.kind == DANFO:      self._draw_danfo(surf)
        elif self.kind == FOOD_STAND: self._draw_foodstand(surf)
        elif self.kind == PEDESTRIAN: self._draw_pedestrian(surf)

    def _draw_danfo(self, surf: pygame.Surface):
        r = self.rect
        # windows
        for wx in range(r.x + 8, r.right - 12, 18):
            win = pygame.Rect(wx, r.y + 8, 12, 10)
            pygame.draw.rect(surf, BLACK,           win)
            pygame.draw.rect(surf, (150, 210, 255), win.inflate(-2, -2))
        # red bottom stripe (Lagos danfo livery)
        stripe = pygame.Rect(r.x, r.bottom - 14, r.w, 14)
        pygame.draw.rect(surf, (200, 60, 0), stripe)
        pygame.draw.rect(surf, BLACK, stripe, 1)
        # wheels
        for cx in (r.x + 14, r.right - 18):
            pygame.draw.circle(surf, BLACK, (cx, r.bottom + 3), 6)
            pygame.draw.circle(surf, GREY,  (cx, r.bottom + 3), 4)

    def _draw_foodstand(self, surf: pygame.Surface):
        r = self.rect
        # tabletop surface
        pygame.draw.rect(surf, (200, 160, 80), (r.x + 3, r.y + 3, r.w - 6, 10))
        # legs extend to ground (visual only — not part of hitbox)
        leg_h = GROUND_Y - r.bottom
        for lx in (r.x + 6, r.right - 10):
            pygame.draw.rect(surf, (100, 60, 20), (lx, r.bottom, 4, leg_h))

    def _draw_pedestrian(self, surf: pygame.Surface):
        r  = self.rect
        cx = r.centerx
        hr = r.w // 2 - 1
        # head
        pygame.draw.circle(surf, SKIN,  (cx, r.y + hr + 2), hr)
        pygame.draw.circle(surf, BLACK, (cx, r.y + hr + 2), hr, 1)
        # shirt stripe over body rect
        shirt = pygame.Rect(r.x + 2, r.y + hr * 2 + 6, r.w - 4, r.h // 3)
        pygame.draw.rect(surf, (70, 110, 200), shirt)


# ────────────────────────────────────────────────────────────── Background ──
class Background:
    """Lagos skyline + road, baked once to a surface for zero per-frame cost."""

    def __init__(self):
        self._static  = pygame.Surface((SCREEN_W, SCREEN_H))
        self._road_cy = GROUND_Y + (SCREEN_H - GROUND_Y) // 2
        self.dash_x   = 0.0
        self._bake()

    def _bake(self):
        s   = self._static
        rng = random.Random(7)          # fixed seed → consistent skyline every run
        s.fill(SKYBLUE)

        x = 0
        while x < SCREEN_W + 120:
            w   = rng.randint(40, 110)
            h   = rng.randint(55, 165)
            col = rng.choice((BLDG_A, BLDG_B))
            pygame.draw.rect(s, col, (x, GROUND_Y - h, w, h))
            for wy in range(GROUND_Y - h + 8, GROUND_Y - 8, 18):
                for wx in range(x + 5, x + w - 5, 14):
                    wc = WIN_LIT if rng.random() > 0.45 else WIN_DRK
                    pygame.draw.rect(s, wc, (wx, wy, 6, 6))
            x += w + rng.randint(4, 18)

        pygame.draw.rect(s, ROAD, (0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y))
        pygame.draw.line(s, GREY, (0, GROUND_Y), (SCREEN_W, GROUND_Y), 2)

    def update(self, speed: float):
        self.dash_x = (self.dash_x - speed * 0.45) % 80

    def draw(self, surf: pygame.Surface):
        surf.blit(self._static, (0, 0))
        x = self.dash_x
        while x < SCREEN_W:
            pygame.draw.rect(surf, DIM_W, (int(x), self._road_cy, 36, 3))
            x += 80


# ────────────────────────────────────────────────────────────────── Game ──
class Game:
    def __init__(self):
        pygame.mixer.pre_init(SAMPLE_RATE, -16, 2, 512)
        pygame.init()
        self.screen  = pygame.display.set_mode((SCREEN_W, SCREEN_H))
        pygame.display.set_caption(TITLE)
        self.clock   = pygame.time.Clock()
        self.sounds  = SoundEngine()
        self.tracker = ScoreTracker()
        self.bg      = Background()
        self.f_big   = pygame.font.SysFont("monospace", 48, bold=True)
        self.f_med   = pygame.font.SysFont("monospace", 28)
        self.f_sm    = pygame.font.SysFont("monospace", 20)
        self.state   = "MENU"
        self._reset()

    # ── helpers ──────────────────────────────────────────────────────────
    def _reset(self):
        self.player        = Player(self.sounds)
        self.obstacles     = []
        self.spawn_timer   = 60
        self.tracker.score = 0

    def _speed(self) -> float:
        return min(BASE_SPEED + self.tracker.score * SPEED_SCALE, MAX_SPEED)

    def _next_spawn(self) -> int:
        sc = self.tracker.score
        hi = max(SPAWN_HI_BASE - sc * SPAWN_SHRINK,       MIN_SPAWN_GAP)
        lo = max(SPAWN_LO_BASE - sc * SPAWN_SHRINK * 0.5, MIN_SPAWN_GAP)
        lo = min(lo, hi)        # guard: randint requires lo ≤ hi
        return random.randint(int(lo), int(hi))

    # ── main loop ────────────────────────────────────────────────────────
    def run(self):
        while True:
            self.clock.tick(FPS)
            self._events()
            if self.state == "PLAYING":
                self._update()
            self._draw()
            pygame.display.flip()

    def _events(self):
        pressed = []
        for ev in pygame.event.get():
            if ev.type == pygame.QUIT:
                pygame.quit(); sys.exit()
            if ev.type == pygame.KEYDOWN:
                pressed.append(ev.key)

        if self.state == "MENU":
            if pygame.K_SPACE in pressed:
                self.state = "PLAYING"
        elif self.state == "PLAYING":
            if pygame.K_SPACE in pressed:
                self.player.jump()
            self.player.set_duck(pygame.key.get_pressed()[pygame.K_DOWN])
        elif self.state == "GAME_OVER":
            if pygame.K_SPACE in pressed or pygame.K_RETURN in pressed:
                self._reset()
                self.state = "PLAYING"

    def _update(self):
        spd = self._speed()
        self.bg.update(spd)
        self.player.update()
        for obs in self.obstacles:
            obs.speed = spd
            obs.update()
        self.obstacles = [o for o in self.obstacles if not o.off_screen()]

        for obs in self.obstacles:
            if self.player.hitbox.colliderect(obs.hitbox):
                self.sounds.play_crash()
                self.tracker.on_death()
                self.state = "GAME_OVER"
                return

        self.spawn_timer -= 1
        if self.spawn_timer <= 0:
            self.obstacles.append(Obstacle(spd))
            self.spawn_timer = self._next_spawn()

        self.tracker.score += 1

    # ── drawing ──────────────────────────────────────────────────────────
    def _draw(self):
        self.bg.draw(self.screen)
        for obs in self.obstacles:
            obs.draw(self.screen)
        self.player.draw(self.screen)
        if   self.state == "MENU":      self._draw_menu()
        elif self.state == "PLAYING":   self._draw_hud()
        elif self.state == "GAME_OVER": self._draw_gameover()

    def _draw_hud(self):
        self.screen.blit(
            self.f_med.render(f"SCORE  {self.tracker.score:06d}", True, WHITE), (12, 8))
        self.screen.blit(
            self.f_sm.render( f"BEST   {self.tracker.best:06d}",  True, GREY),  (12, 42))

    def _overlay(self, alpha: int):
        ov = pygame.Surface((SCREEN_W, SCREEN_H), pygame.SRCALPHA)
        ov.fill((0, 0, 0, alpha))
        self.screen.blit(ov, (0, 0))

    def _centre(self, text: str, font: pygame.font.Font, color: tuple, y: int):
        s = font.render(text, True, color)
        self.screen.blit(s, s.get_rect(center=(SCREEN_W // 2, y)))

    def _draw_menu(self):
        self._overlay(130)
        self._centre("OLÉ!",                      self.f_big, YELLOW,  118)
        self._centre("Lagos Street Runner",        self.f_med, WHITE,   178)
        self._centre("SPACE = Jump  |  ↓ = Duck", self.f_sm,  DIM_W,   216)
        self._centre("Press SPACE to start",       self.f_med, CYAN,    288)

    def _draw_gameover(self):
        self._overlay(155)
        self._centre("GAME OVER",                      self.f_big, RED,    118)
        self._centre(f"Score:  {self.tracker.score}",  self.f_med, WHITE,  196)
        self._centre(f"Best:   {self.tracker.best}",   self.f_med, YELLOW, 233)
        self._centre("SPACE / ENTER to restart",       self.f_sm,  DIM_W,  295)


if __name__ == "__main__":
    Game().run()
