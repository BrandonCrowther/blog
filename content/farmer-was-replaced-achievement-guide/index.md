+++
title = "The Farmer Was Replaced Achievement Guide"
date = 2026-07-01
slug = "farmer-was-replaced-achievement-guide"
+++


This guide is a collection of how to complete the most difficult challenges in [The Farmer Was Replaced](https://store.steampowered.com/app/2060160/The_Farmer_Was_Replaced/), a game where you use drone(s) to automate farming a progressively more complicated series of crops using a subset of the Python language.

In my job I very rarely get a chance to write code completely by hand anymore, and knew very little about Python itself, so I took 100%ing the game as a chance to reinvigorate my love of code while learning a new language at the same time. To that end, the entirety of the code on this page is completely hand written, no LLMs allowed here.

The guide is divided into logical groupings based on the required crop for each achievement, and for the most part a single script is sufficient to get them all at the same time. Most code shares a few functions, and so a [Common](@/farmer-was-replaced-achievement-guide/index.md#common-code) library exists at the bottom of this page.

-----------------------------------------------------------

## Achievements

### Sunflower Master & Big Power Farmer

{{ side_by_side(img1="045_sunflower_master.png", alt1="Farm 12000 power in 1 minute.", img2="033_big_power_farmer.png", alt2="Farm 100000 power.") }}

These are worth figuring out first, because you'll want a stash of excess Power in order to move fast enough to do anything below. This really simply assigns each drone a column of your farm, plants Sunflowers, and then scans the column over and over again for anything to harvest.

This pays no heed to the internal game rules to maximize production and still yields about **14,000 Power per minute**. Plenty for our purposes.

{{ video(src="Power.webm") }}

```python
# Power.py

import Common

entity = Entities.Grass
instructions = Common.get_planting_instructions(entity)

def driver(x, y):
    Common.move_to(x,y)
    instructions()
    while True:
        while get_water() < 0.75:
            use_item(Items.Water)
        Common.polyculture()
        Common.await_harvest()
        harvest()

clear()
for i in range(6):
    for j in range(6):
        if i + j != 0:
            spawn_drone(driver, 3 + i*5, 3 + j*5)
driver(3, 3)

```

### Hay Master & Big Hay Farmer

{{ side_by_side(img1="054_hay_master.png", alt1="Farm 200 million hay in 1 minute.", img2="043_big_hay_farmer.png", alt2="Farm 1 billion hay.") }}

The Hay related achievements can be tackled by making efficient use of [Polyculture](https://thefarmerwasreplaced.wiki.gg/wiki/Polyculture) and keeping your [Water](https://thefarmerwasreplaced.wiki.gg/wiki/Watering) levels high enough.

The algorithm is fairly simple for this one and really only is harvesting a single plot. Space each of your drones out into a grid with 5 spaces between them. Then, you can simply call `get_companion()` on the drone to grab the Polyculture requirements, plant that and then just come back to your plot. Each adjacent drone will technically share a single space and occasionally collide, but this is a very rare race condition not worth optimizing.

{{ video(src="Hay.webm") }}

```python
# Hay.py

import Common

entity = Entities.Sunflower
instructions = Common.get_planting_instructions(entity)

def driver(x,y):
    Common.move_to(x,y)
    while True:
        while get_water() < 0.75:
            use_item(Items.Water)
        if can_harvest():
            harvest()
        instructions()
        move(North)

clear()
for x in range(1, 32):
    spawn_drone(driver, x, 0)
driver(0, 0)

```

Following this correctly should yield around **550,000,000 Hay per minute**.

### Wood Master & Big Wood Farmer

{{ side_by_side(img1="055_wood_master.png", alt1="Farm 1 billion wood in 1 minute.", img2="038_big_wood_farmer.png", alt2="Farm 1 billion wood.") }}

This is where things get a bit more difficult. The Hay algorithm using a single plot is insufficient here because it will get bottlenecked on the much longer time Trees take to grow.

Instead, we play a trick with the Polyculture system where we re-plant over and over again until we get a desirable outcome. Assign each drone a column, and plant Trees in a checkerboard pattern, leaving Hay wherever Trees are not placed. When planting a new tree, immediately call `get_companion()` on it. If the resulting pairing is not Hay or if the distance from the origin tile is equal to 2 (per the checkerboard pattern), retry.

{{ video(src="Trees.webm") }}

```python
# Trees.py

import Common

entity = Entities.Tree
instructions = Common.get_planting_instructions(entity)

def driver(x,y):
    Common.move_to(x,y)
    while True:
        Common.await_harvest()
        while get_water() < 0.5:
            use_item(Items.Water)
        harvest()
        instructions()
        loop = False
        while loop == False:
            harvest()
            plant(entity)
            plant_type, (px, py) = get_companion()
            if plant_type == Entities.Grass:
                if abs(x - px) + abs(y - py) != 2:
                    loop = True
        move(North)
        move(North)


clear()
for x in range(1, get_world_size()):
    spawn_drone(driver, x, x % 2)
driver(0, 0)
```

### Carrot Master & Big Carrot Farmer

{{ side_by_side(img1="057_carrot_master.png", alt1="Farm 200 million carrots in 1 minute.", img2="046_big_carrot_farmer.png", alt2="Farm 1 billion carrots.") }}

Carrots share the exact same problem space as Tree farming, so we can just copy that solution and apply it here, too.

{{ video(src="Carrots.webm") }}

```python
# Carrot.py

import Common

entity = Entities.Carrot
instructions = Common.get_planting_instructions(entity)

def driver(x,y):
    Common.move_to(x,y)
    while True:
        Common.await_harvest()
        while get_water() < 0.5:
            use_item(Items.Water)
        harvest()
        instructions()
        loop = False
        while loop == False:
            harvest()
            plant(entity)
            plant_type, (px, py) = get_companion()
            if plant_type == Entities.Grass:
                if abs(x - px) + abs(y - py) != 2:
                    loop = True
        move(North)
        move(North)


clear()
for x in range(1, get_world_size()):
    spawn_drone(driver, x, x % 2)
driver(0, 0)
```

### Cactus Master & Big Cactus Farmer

{{ side_by_side(img1="047_cactus_master.png", alt1="Farm 20 million cacti in 1 minute.", img2="040_big_cactus_farmer.png", alt2="Farm 100 million cacti.") }}

{{ side_by_side(img1="041_wrong_order.png", alt1="Sort a full field of cacti the wrong way round." ) }}

Cactus require using drones to sort each column and row in parallel with each other. The one real snag is that if a drone starts sorting a column while another is still sorting a row their efforts will conflict with each other. To further complicate this, drones have no channel to communicate with each other directly, they can only check if other drones exist.

The solution to this is to maintain a 'master' drone that delegates its' tasks to slave drones, and use the death of a drone when its' task finishes to signal that a row or column has finished. So the process from your master drone becomes:

- Assign drones to sort rows
- Wait for them to finish
- Assign drones to sort columns wait again
- Call `harvest()` and repeat

For Wrong Order, simply use `sort_desc` instead of `sort_asc` in the Cactus code below.

{{ video(src="Cactus.webm") }}

```python
# Cactus.py

import Common

def sort(stack, comparator):
    for index in range(len(stack)):
        lowest_index = index
        for c in range(index + 1, len(stack)):
            if comparator(stack[c], stack[lowest_index]):
                lowest_index = c
        tmp = stack[index]
        stack[index] = stack[lowest_index]
        stack[lowest_index] = tmp
    return stack

def sort_asc(stack):
    def comparator(a, b):
        return a < b
    return sort(stack, comparator)
    
def sort_desc(stack):
    def comparator(a, b):
        return a > b
    return sort(stack, comparator)

def prep_field(entity, dir, instructions):
    sizes = []
    for i in range(get_world_size()):
        instructions()
        plant(entity)
        sizes.append(measure())
        move(dir)
    return sizes
    

def move_item(x, y):
    while get_pos_x() < x:
        swap(East)
        move(East)
    while get_pos_x() > x:
        swap(West)
        move(West)
    while get_pos_y() < y:
        swap(North)
        move(North)
    while get_pos_y() > y:
        swap(South)
        move(South)
    
def perform_sort(array, dir):
    for i in range(len(array)):
        target_number = array[i]
        m = measure()
        while m != target_number:
            move(dir)
            m = measure()
        if dir == North or dir == South:
            x = get_pos_x()
            move_item(x, i)
            if i + 1 < get_world_size():
                Common.move_to(x, i + 1)
        else:
            y = get_pos_y()
            move_item(i, y)
            if i + 1 < get_world_size():
                Common.move_to(i + 1, y)

```

```python
# Cactus Driver.py

import Common
import Cactus

entity = Entities.Cactus
def driver(x, y, dir):
    Common.move_to(x,y)
    # Delegate spawning additional drones recursively
    if num_drones() < max_drones():
        if dir == North or dir == South:
            spawn_drone(driver, x + 1, 0, dir)
        else:
            spawn_drone(driver, 0, y + 1, dir)
    instructions = Common.get_planting_instructions(entity)
    sizes = Cactus.prep_field(entity, dir, instructions)
    sorted = Cactus.sort_asc(sizes)
    Cactus.perform_sort(sorted, dir)
        

clear()
# Drone 0 acts as the control plane
# It delegates jobs to short lived slave drones
while True:
    driver(0, 0, East)
    
    count = num_drones()
    while count > 1:
        count = num_drones()
    driver(0, 0, North)
    
    count = num_drones()
    while count > 1:
        count = num_drones()

    harvest()
    Common.move_to(0,0)
```

### Pumpkin Master & Big Pumpkin Farmer

{{ side_by_side(img1="056_pumpkin_master.png", alt1="Farm 20 million pumpkins in 1 minute.", img2="042_big_pumpkin_farmer.png", alt2="Farm 100 million pumpkins.") }}

Pumpkin Master requires parallelizing the farming of one giant farm-sized pumpkin while managing [Fertilizer](https://thefarmerwasreplaced.wiki.gg/wiki/Fertilizer) usage. Assign each drone a column and set them up to make 2 passes over the field. On the first pass the drone simply plants a Pumpkin in each row. On the second pass, find any failed crops and re-plant them while using Fertilizer to speed up growth.

The above strategy is fairly straight forward, the only problem is - how do you know when to call `harvest()`? Pumpkins fortunately have an undocumented property we can take advantage of: they assign themselves a unique integer that you can discover with `measure()`. Pumpkins that merge together also take on the identity of the oldest surviving Pumpkin. So if each drone stores the identifier of the first Pumpkin it plants they can check what the identifier of the Pumpkin underneath them is after they have finished both passes. If the identifier matches their first plant you can assume the Pumpkin has finished propagating, then call `harvest()` and start over again.

{{ video(src="Pumpkins.webm") }}

```python
# Pumpkins.py

import Common

entity = Entities.Pumpkin
instructions = Common.get_planting_instructions(entity)

def force_grow_pumpkin():
    gee = get_entity_type()
    if gee == None:
        return True
    if gee == Entities.Pumpkin and can_harvest():
        return True
    plant(Entities.Pumpkin)
    use_item(Items.Fertilizer)
    use_item(Items.Weird_Substance)
    use_item(Items.Weird_Substance)
    return force_grow_pumpkin()
    
def driver(x, y):
    Common.move_to(x,y)    
    if x != get_world_size() - 1:
        spawn_drone(driver, x + 1, 0)
    while True:
        protocol(x, y)

def protocol(x,y):
    first_pumpkin = -1
    # First pass - plant normally
    for i in range(get_world_size()):
        instructions()
        if i == 0:
            first_pumpkin = measure()
        while get_water() < 0.75:
            use_item(Items.Water)
        move(North)
        
    # Second pass, replant and Fertilizer
    for i in range(get_world_size()):
        force_grow_pumpkin()
        
        if i == 0:
            first_pumpkin = measure()
            
        # Once finished, check to see if
        # our drone's first pumpkin is the winner
        if get_pos_y() == get_world_size() - 1:
            m = measure()
            while m != None:
                m = measure()
                if m == first_pumpkin:
                    harvest()
        move(North)


clear()
driver(0, 0)
```

### Maze Master, Recycling, & Big Gold Farmer

{{ side_by_side(img1="058_maze_master.png", alt1="Farm 2 million gold in 1 minute.", img2="049_recycling.png", alt2="Reuse the same maze 300 times.") }}

{{ side_by_side(img1="052_big_gold_farmer.png", alt1="Farm 100 million gold.") }}

Achieving 2 million Gold in 1 minute is the second hardest achievement behind getting on the Full Reset leaderboard, and required at least 4-5 completely different attempts to get right.

In the end, the approach was to segment the farm off into 16 chunks and send two drones into each chunk, allowing the drones. The drones then explore the maze until they find the treasure. Drones keep track of where they've gone using a recursive algorithm that forks off on every intersection in the maze, so when a drone needs to come back from a dead end it can simply pop its' backstack of directions until it arrives at its' last intersection. Drones also maintain a memory of dead ends it hits, so once walls start being removed the drone does not get caught in an infinite loop.

Segmentation into multiple mazes instead of one large maze was chosen to increase the efficiency gained by wall removal when a maze is re-used. 16 mazes can have many more walls removed before needing to be reset than 1 large maze.

Drones also order the paths they explore by the distance their next move is from the Treasure. The first drone will always move in the direction that takes it closer to the Treasure, and does most of the heavy lifting for maze resolution. The second drone takes the opposite approach and explores the least likely so they do not gradually converge on each other and stay overlapping forever.

Finally, before any of the above happens, the Drone has to call `measure()` to check if the other drone solved the maze. If it has, reset and repeat.

{{ video(src="Maze.webm") }}

```python
# Mazes.py

import Common

opposite_directions = {
    North: South,
    South: North,
    East: West,
    West: East
}

coordinate_adjustments = {
    North: [0, 1],
    South: [0, -1],
    East: [1, 0],
    West: [-1, 0]
}

is_slave = False
dead_ends = []
treasure_location = None

def reset_memory():
    global dead_ends
    dead_ends = []
    global treasure_location
    treasure_location = measure()

def harvest_treasure(maze_size):
    substance = maze_size * 2**(num_unlocked(Unlocks.Mazes) - 1)
    success = use_item(Items.Weird_Substance, substance)

def initialize_maze(maze_size, x, y):
    harvest()
    Common.move_to(x,y)
    plant(Entities.Bush)
    harvest_treasure(maze_size)

def random_elem(list):
    index = random() * len(list) // 1
    return list[index]
    

def valid_moves(previous_move = None):
    ret = []
    moves = set((North, East, South, West))
    
    if get_entity_type() == Entities.Grass:
        return ret
    
    if previous_move != None:
        moves.remove(opposite_directions[previous_move])
    
    for m in set(moves):
        adj = coordinate_adjustments[m]
        px, py = get_pos_x(), get_pos_y() 
        x, y = px + adj[0], py + adj[1]
        
        if not can_move(m) or is_dead_end(x, y):
            moves.remove(m)
        else:
            meas = measure()
            if meas == None:
                return []
            tx, ty = meas[0], meas[1]
            distx = abs(tx - px)
            disty = abs(ty - py)
            cdistx = abs(tx - x)
            cdisty = abs(ty - y)
            if cdistx + cdisty < distx + disty:
                ret.insert(0, m)
            else:
                ret.append(m)
        
    # slave works backwards
    if is_slave:
        rev = []
        for i in range(len(ret)):
            rev.insert(0, ret.pop())
        return rev

    return ret

def is_dead_end(x = get_pos_x(), y = get_pos_y()):
    for i in dead_ends:
        if i[0] == x and i[1] == y:
            return True
    return False


def backtrack(backstack):
    while(len(backstack) > 0):
        if get_entity_type() == Entities.Treasure:
            global dead_ends
            dead_ends = []
            return True
        move(backstack.pop())
    return False
        
def recurse(direction, backstack):    
    move(direction)
    backstack.append(opposite_directions[direction])
    
    meas = measure()
    if meas != treasure_location:
        reset_memory()
        return False

    entity = get_entity_type()
    if entity != Entities.Hedge and entity != Entities.Treasure:
        return False
    
    if entity == Entities.Treasure:
        return True
    
    moves = valid_moves(direction)
    move_len = len(moves)
    if move_len > 1:
        global dead_ends
        dead_ends.append([get_pos_x(), get_pos_y()])
    for m in moves:
        if m == opposite_directions[direction]:
            continue
        ret = recurse(m, [])
        if ret == True:
            return True
    
    bt = backtrack(backstack)
    backstack = []
    return bt
        

def start_solving(set_slave = False):
    global is_slave
    is_slave = set_slave
    reset_memory()
    moves = valid_moves()
    for m in moves:
        ret = recurse(m, [])    
        if ret:
            return True
```

### Dino Master, Long Dinosaur, Size Matters, & Big Bone Farmer

{{ side_by_side(img1="048_dino_master.png", alt1="Farm 1 million bones in 1 minute.", img2="032_long_dinosaur.png", alt2="Have a dinosaur that fills the entire farm." ) }}

{{ side_by_side(img1="039_size_matters.png", alt1="Get a dinosaur to length 1000." img2="044_big_bone_farmer.png" alt2="Farm 100 million bones.") }}

Despite being at the bottom of the list, this is one of the easiest solutions to put together by using something called a [Hamiltonian Cycle](https://en.wikipedia.org/wiki/Hamiltonian_path). Simply put, you find a path that both travels every plot on the farm exactly once that also ends where it begins, and just follow it over and over again until the Snake spans the entire farm. This is a fairly slow process, but once it completes all of the achievements above should unlock at once.

{{ video(src="Snake.webm") }}

```python
# Dinosaurs.py

def movef(dir):
    if not can_move(dir):
        return True
    move(dir)
    return False

def cycle():
    ws = get_world_size()
    change_hat(Hats.Brown_Hat)
    change_hat(Hats.Dinosaur_Hat)
    while True:
        # Loop north
        while get_pos_y() < ws - 1:
            if movef(North):
                return True
        if get_pos_x() != ws - 1:
            if movef(East):
                return True
        
        # Loop south to y = 1
        while get_pos_y() > 1:
            if movef(South):
                return True
        if get_pos_x() != ws - 1:
            if movef(East):
                return True
        # If we're at the end, go down
        # then travel west back to the start
        if(get_pos_x() == ws - 1 and get_pos_y() == 1):
            if movef(South):
                return True
            while get_pos_x() != 0:
                if movef(West):
```

```python
# Dino_Achievement.py

import Dinosaurs

clear()
while(True):
    Dinosaurs.cycle()
```

### Full Automation

{{ side_by_side(img1="059_full_automation.png", alt1="Get on the full reset leaderboard.") }}

This is the most challenging of all achievements in the game, deserving of its' own post. Coming soon.

-----------------------------------------------------------

## Common Code

Some code is shared amongst most or all the achievement scripts. They are detailed here for reference.

```python
# Common.py

def await_harvest():
    h = can_harvest()
    while not h:
        h = can_harvest()

def move_to(x, y):
    # For full reset - can_move() is unlocked when Mazes are
    def p_can(dir):
        return num_unlocked(Unlocks.Mazes) == 0 or can_move(dir)

    while get_pos_x() < x and p_can(East):
        move(East)
    while get_pos_x() > x and p_can(West):
        move(West)
    while get_pos_y() < y and p_can(North):
        move(North)
    while get_pos_y() > y and p_can(South):
        move(South)


def p_make_callback(entity, ground_type):
    def callback():
        if get_ground_type() != ground_type:
            till()
        if get_entity_type() != entity:
            plant(entity)

    return callback


p_planting_table = {
    Entities.Grass: p_make_callback(Entities.Grass, Grounds.Grassland),
    Entities.Bush: p_make_callback(Entities.Bush, Grounds.Grassland),
    Entities.Carrot: p_make_callback(Entities.Carrot, Grounds.Soil),
    Entities.Tree: p_make_callback(Entities.Grass, Grounds.Grassland),
    Entities.Cactus: p_make_callback(Entities.Cactus, Grounds.Soil),
    Entities.Pumpkin: p_make_callback(Entities.Pumpkin, Grounds.Soil),
    Entities.Sunflower: p_make_callback(Entities.Sunflower, Grounds.Soil),
}


def get_planting_instructions(entity):
    return p_planting_table[entity]


def polyculture():
    x, y = get_pos_x(), get_pos_y()
    plant_type, (px, py) = get_companion()
    instructions = get_planting_instructions(plant_type)
    move_to(px, py)
    harvest()
    instructions()
    move_to(x, y)
```
