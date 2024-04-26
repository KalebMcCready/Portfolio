const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const GRID_SIZE = 50;
const GRID_ROWS = canvas.height / GRID_SIZE;
const GRID_COLS = canvas.width / GRID_SIZE;
const buildAreas = [
    { x: 187, y: 200, width: 40, height: 40, borderWidth: 2, borderColor: "#77ae00" },
    { x: 187, y: 280, width: 40, height: 40, borderWidth: 2, borderColor: "#77ae00" },
    { x: 335, y: 290, width: 40, height: 40, borderWidth: 2, borderColor: "#77ae00" },
    { x: 415, y: 290, width: 40, height: 40, borderWidth: 2, borderColor: "#77ae00" },
    ];
const towerPrices = {
    "brown": 50,
    "grey": 100,
    "red": 150
};
const castleImage = new Image();
castleImage.src = "Elements/castle.png";
const castleX = 710;
const castleY = 80;
const heartImage = new Image();
heartImage.src = "Elements/heart.png";
const heartWidth = 30; // Adjust the width of the heart icon
const heartHeight = 30; // Adjust the height of the heart icon
const heartPadding = 10;
const GOLD_PER_ENEMY = 10;

let towerBought = false;
let towers = [];
let enemies = [];
let projectiles = [];
let gold = 200;
let isPlayerDead = false;
let selectedBuildArea = null;
let playerHealth = 3;
let message = ""; // Variable to store the message
let showMessage = false; // Flag to control message display
let messageDuration = 6000; // Duration in milliseconds for the message to appear
let visualEffects = [];

// Function to show the message for a certain duration
function showMessageWithDuration(text) {
    message = text;
    showMessage = true;
    setTimeout(() => {
        showMessage = false;
    }, messageDuration);
}

function drawCastle() {
    // Draw the castle image at the specified coordinates
    ctx.drawImage(castleImage, castleX, castleY, castleImage.width, castleImage.height);
}

function drawHearts() {
    for (let i = 0; i < playerHealth; i++) {
        ctx.drawImage(heartImage, canvas.width - (i + 1) * (heartWidth + heartPadding), heartPadding, heartWidth, heartHeight);
    }
}

function drawMessage() {
    if (showMessage) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(message, canvas.width / 2, 30);
    }
}

function removeHeart() {
    playerHealth--;
    if (playerHealth <= 0) {
        isPlayerDead = true;
    }
}

// Load tower images
const brownTowerImg = new Image();
brownTowerImg.onload = () => {
    console.log("Brown tower image loaded.");
};
brownTowerImg.src = "Elements/brownTower.png";

const greyTowerImg = new Image();
greyTowerImg.src = "Elements/greyTower.png";

const redTowerImg = new Image();
redTowerImg.src = "Elements/redTower.png";

// Define waypoints for enemy path
const waypoints = [
    { x: 0, y: 300 },
    { x: 100, y: 300 },
    { x: 100, y: 110 },
    { x: 270, y: 110 },
    { x: 270, y: 350 },
    { x: 480, y: 350 },
    { x: 480, y: 240 },
    { x: 700, y: 240 }
];

class Enemy {
    constructor() {
        this.waypointIndex = 0;
        this.currentWaypoint = waypoints[this.waypointIndex];
        this.x = this.currentWaypoint.x;
        this.y = this.currentWaypoint.y;
        this.health = 150;
        this.speed = 0.25;
        this.images = [zombieWalk1Img, zombieWalk2Img]; // Array of enemy images
        this.frameCount = 0; // Track frame count for image alternation
        this.currentImageIndex = 0; // Index of the current image in the images array
        this.hurtImage = zombieHurtImg; // Image for hurt state
        this.hurt = false; // Flag to indicate if enemy is hurt
        this.hurtFrames = 0; // Track frames for hurt animation
        this.ENEMY_SIZE = 40; // Increase the size of the enemy hitbox
        this.reachedLastWaypoint = false; // Flag to track if enemy reached the last waypoint
        this.isSlowed = false; // Add a flag to indicate slow status
        this.slowEffectDuration = 0;
        this.originalSpeed = this.speed;
        this.width = GRID_SIZE;
        this.height = GRID_SIZE;
        this.iceEffectRadius = this.width / 4;
        this.maxRadius = this.width / 2;
        this.minRadius = this.width / 4;
        this.pulseDirection = 1;
        this.pulseSpeed = 0.1;
    }

    hit(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.remove();
            gold += GOLD_PER_ENEMY;
            updateGoldDisplay();
        } else {
            // Set the hurt flag to true when hit
            this.hurt = true;
            this.hurtFrames = 20; // Number of frames to show hurt animation
        }
    }

    remove() {
        let index = enemies.indexOf(this);
        if (index !== -1) {
            enemies.splice(index, 1);
        }
    }

    update() {
         const tolerance = 0.5;

    // Approach current waypoint
    let dx = this.currentWaypoint.x - this.x;
    let dy = this.currentWaypoint.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.speed) {
        // Snap to waypoint if within one step distance
        this.x = this.currentWaypoint.x;
        this.y = this.currentWaypoint.y;
    } else {
        // Move towards waypoint
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;
    }

    // Check if within tolerance to consider as reached
    if (Math.abs(this.x - this.currentWaypoint.x) <= tolerance && Math.abs(this.y - this.currentWaypoint.y) <= tolerance) {
        this.waypointIndex++;
        if (this.waypointIndex < waypoints.length) {
            this.currentWaypoint = waypoints[this.waypointIndex];
        } else {
            // Reached the last waypoint
            this.reachedLastWaypoint = true;
            removeHeart();
            this.remove();
        }
    }
        
        if (this.isSlowed) {
            this.iceEffectRadius += this.pulseDirection * this.pulseSpeed;
            if (this.iceEffectRadius >= this.maxRadius || this.iceEffectRadius <= this.minRadius) {
                this.pulseDirection *= -1;
            }
            this.slowEffectDuration--;

            if (this.slowEffectDuration <= 0) {
                this.isSlowed = false;
                this.speed = this.originalSpeed; // Reset speed when slow effect wears off
            }
        }
        // If hurt, decrement hurt frames and switch images
        if (this.hurt) {
            this.hurtFrames--;
            if (this.hurtFrames <= 0) {
                this.hurt = false; // Reset hurt flag after animation
            }
        }

        // Increment frame count
        this.frameCount++;
        if (this.frameCount >= 20) { // Adjust frame count as needed for desired speed of image alternation
            this.frameCount = 0;
            // Toggle between 0 and 1 to alternate between images
            this.currentImageIndex = (this.currentImageIndex === 0) ? 1 : 0;
        }
    }

    draw() {
        // Draw the current image
        if (this.hurt) {
            ctx.drawImage(this.hurtImage, this.x, this.y, GRID_SIZE, GRID_SIZE);
        } else {
            ctx.drawImage(this.images[this.currentImageIndex], this.x, this.y, GRID_SIZE, GRID_SIZE);
        }
        if (this.isSlowed) {
            ctx.fillStyle = 'rgba(0, 191, 255, 0.5)'; // Light blue color for ice
            ctx.beginPath();
            ctx.arc(this.x + GRID_SIZE / 2, this.y + GRID_SIZE / 2, this.iceEffectRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
     applySlow(duration) {
        if (!this.isSlowed) {
            this.isSlowed = true;
            this.speed *= 0.5; // Reduce speed by 50% only if not already slowed
            this.slowEffectDuration = duration;
        } else {
        this.slowEffectDuration = Math.max(this.slowEffectDuration, duration); // Extend duration if already slowed
    }

  }

}


// Load enemy images
const zombieWalk1Img = new Image();
zombieWalk1Img.src = "Elements/zombie_walk1.png";

const zombieWalk2Img = new Image();
zombieWalk2Img.src = "Elements/zombie_walk2.png";

const zombieHurtImg = new Image();
zombieHurtImg.src = "Elements/zombie_hurt.png";

class Tower {
    constructor(x, y, type, price, img) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.price = price;
        this.img = img;
        this.range = 150; // Adjust range as needed
        this.fireRate = 60; // Adjust fire rate as needed (in frames)
        this.fireCounter = 0;
        this.width = GRID_SIZE / .5;
        this.height = GRID_SIZE / .5;
         }

    update() {
        this.fireCounter++;
        if (this.fireCounter >= this.fireRate) {
            this.fire();
            this.fireCounter = 0;
        }
    }

    fire() {
        let target = this.findTarget();
        if (target) {
            let projectile = this.createProjectile(target);
            if (projectile) {
                projectiles.push(projectile);
            }
        }
    }

    findTarget() {
        for (let enemy of enemies) {
            let distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
            if (distance <= this.range) {
                return enemy;
            }
        }
        return null;
    }

    createProjectile(target) {
        // This method should be overridden in each specific tower class
        // Placeholder return to avoid errors in the base class
        return null;
    }

    update() {
        this.fireCounter++;
        if (this.fireCounter >= this.fireRate) {
            this.fire();
            this.fireCounter = 0;
        }
    }

    draw() {
        ctx.drawImage(this.img, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
}

    purchase() {
    console.log(`Attempting to purchase tower: ${this.type}, Cost: ${this.price}, Available Gold: ${gold}`);
    if (gold >= this.price) {
        gold -= this.price;
        console.log(`Purchase successful. Gold deducted: ${this.price}. Remaining Gold: ${gold}`);

        if (gold < 0) {
            gold = 0;
            console.log("Error: Gold went negative, reset to 0.");
        }
        
        updateGoldDisplay();
        return true;
    } else {
        console.log("Insufficient gold to purchase this tower.");
        showMessageWithDuration("Insufficient gold to purchase this tower!");
        return false;
    }

  }

}

class BrownTower extends Tower {
    constructor(x, y) {
        super(x, y, "brown", 50, brownTowerImg);
        this.range = 150;
        this.fireRate = 80;
    }

    createProjectile(target) {
        return new BlackArrow
        (this.x, this.y, target); // Creates a Black Arrow projectile specific to BrownTower
    }
}

class GreyTower extends Tower {
    constructor(x, y) {
        super(x, y, "grey", 100, greyTowerImg);
        this.range = 150;
        this.fireRate = 60;
    }

    createProjectile(target) {
        return new IceBolt(this.x, this.y, target); // Creates an Ice Bolt projectile that slows enemies
    }
}

class RedTower extends Tower {
    constructor(x, y) {
        super(x, y, "red", 150, redTowerImg);
        this.range = 150;
        this.fireRate = 50;
    }

    createProjectile(target) {
        return new Fireball(this.x, this.y, target); // Creates a Fireball projectile with area damage
    }
}


class Projectile {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = 2.5;
        this.damage = 10;
        this.size = 10;
    }

    update() {
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let distance = Math.sqrt(dx ** 2 + dy ** 2);
        let speedX = dx / distance * this.speed;
        let speedY = dy / distance * this.speed;

        this.x += speedX;
        this.y += speedY;

        if (distance <= this.size / 2 + this.target.ENEMY_SIZE / 2) {
            this.hitEffect();
            this.remove();
        }
    }

    draw() {
        ctx.fillStyle = this.color;  // Color will be set by subclass
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    hitEffect() {
        this.target.hit(this.damage);
    }

    remove() {
        let index = projectiles.indexOf(this);
        if (index !== -1) {
            projectiles.splice(index, 1);
        }
    }
}

class BlackArrow extends Projectile {
    constructor(x, y, target) {
        super(x, y, target);
        this.color = "#000000"; // Black color for projectile
        this.speed = 3;
        this.size = 3;
    }
}

class IceBolt extends Projectile {
    constructor(x, y, target) {
        super(x, y, target);
        this.color = "#007bff"; // Blue color for projectile
        this.originalSpeed = target.speed;
    }
 hitEffect() {
        super.hitEffect();
        this.target.applySlow(210);
    }
}   

class Fireball extends Projectile {
    constructor(x, y, target) {
        super(x, y, target);
        this.color = "#ff0000"; // Red color for projectile
        this.blastRadius = 30; // Radius of damage effect
    }

    hitEffect() {
        // Damage all enemies within the blast radius
        enemies.forEach(enemy => {
            let dx = enemy.x - this.x;
            let dy = enemy.y - this.y;
            let distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance <= this.blastRadius) {
                enemy.hit(this.damage);
            if (!visualEffects.some(effect => effect.x === this.x && effect.y === this.y)) {
                    visualEffects.push(new VisualEffect(this.x, this.y, 1, 50, 'rgba(255, 0, 0, 0.6)', 2));
                }
            }
        });
    }
}

class VisualEffect {
    constructor(x, y, startRadius, maxRadius, color, expansionRate) {
        this.x = x;
        this.y = y;
        this.radius = startRadius;
        this.maxRadius = maxRadius;
        this.color = color;
        this.expansionRate = expansionRate;
        this.active = true;
    }

    update() {
        if (this.radius < this.maxRadius) {
            this.radius += this.expansionRate;
        } else {
            this.active = false;
        }
    }

    draw() {
        if (!this.active) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}


function updateGoldDisplay() {
    document.getElementById("goldAmount").textContent = gold;
}

function buyTower(type, price, img, mouseX, mouseY) {
    console.log("Buy tower function called");
    console.log("Mouse coordinates:", mouseX, mouseY);

    for (let buildArea of buildAreas) {
        if (mouseX >= buildArea.x && mouseX <= buildArea.x + buildArea.width && mouseY >= buildArea.y && mouseY <= buildArea.y + buildArea.height) {
            let towerX = buildArea.x + buildArea.width / 2;
            let towerY = buildArea.y + buildArea.height / 2;

            if (towers.some(tower => Math.abs(tower.x - towerX) < GRID_SIZE / 2 && Math.abs(tower.y - towerY) < GRID_SIZE / 2)) {
                console.log("There is already a tower at this location!");
                showMessageWithDuration("There is already a tower at this location!");
                return;
            }

            let tower = newTower(type, towerX, towerY); // Create the new tower object
            if (tower.purchase()) { // The purchase method now handles everything
                towers.push(tower); // Add to the list only if purchase was successful
            }
            return;
        }
    }
}

castleImage.onload = function() {
    // Call the drawCastle function after the image has been successfully loaded
    drawCastle();
};

// Event listener to handle image loading errors
castleImage.onerror = function() {
    console.error("Failed to load the castle image.");
};

function init() {
 canvas.addEventListener("click", function(event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    if (towerBought && selectedTowerType) {
        for (let buildArea of buildAreas) {
            if (mouseX >= buildArea.x && mouseX <= buildArea.x + buildArea.width && mouseY >= buildArea.y && mouseY <= buildArea.y + buildArea.height) {
                let towerX = buildArea.x + buildArea.width / 2;
                let towerY = buildArea.y + buildArea.height / 2;
                let towerExists = towers.some(tower => Math.abs(tower.x - towerX) < GRID_SIZE / 2 && Math.abs(tower.y - towerY) < GRID_SIZE / 2);

                if (!towerExists) {
                    let tower = null;
                    switch (selectedTowerType) {
                        case "brown":
                            tower = new BrownTower(towerX, towerY);
                            break;
                        case "grey":
                            tower = new GreyTower(towerX, towerY);
                            break;
                        case "red":
                            tower = new RedTower(towerX, towerY);
                            break;
                        default:
                            console.error("Invalid tower type");
                            return;
                    }
                    if (tower && tower.purchase()) {
                        towers.push(tower);
                        updateGoldDisplay();
                    } else {
                        showMessageWithDuration("Insufficient gold to purchase this tower!");
                    }
                    towerBought = false;
                    selectedTowerType = null;
                    return;
                } else {
                    showMessageWithDuration("There is already a tower at this location!");
                }
            }
        }
    }
});
   
    updateGoldDisplay();

    document.getElementById("buyBrownTower").addEventListener("click", function() {
    towerBought = true;
    selectedTowerType = "brown"; // Store the selected tower type
});

document.getElementById("buyGreyTower").addEventListener("click", function() {
    towerBought = true;
    selectedTowerType = "grey"; // Store the selected tower type
});

document.getElementById("buyRedTower").addEventListener("click", function() {
    towerBought = true;
    selectedTowerType = "red"; // Store the selected tower type
});

    setInterval(function() {
        let y = Math.random() * (canvas.height - GRID_SIZE);
        enemies.push(new Enemy());
    }, 4000);
}

function drawBuildAreaBorder() {
    for (let area of buildAreas) {
        ctx.strokeStyle = area.borderColor;
        ctx.lineWidth = area.borderWidth;
        ctx.strokeRect(area.x, area.y, area.width, area.height);
    }
}

function drawGrid() {
    for (let i = 0; i < GRID_ROWS; i++) {
        for (let j = 0; j < GRID_COLS; j++) {
            let x = j * GRID_SIZE;
            let y = i * GRID_SIZE;
            // Draw different grid squares based on row and column
            if ((i + j) % 2 === 0) {
                ctx.fillStyle = "#a8d0e6"; // Light blue
            } else {
                ctx.fillStyle = "#6f9bb3"; // Dark blue
            }
            ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
        }
    }
    drawBuildAreaBorder();
}


    drawGrid();

    
for (let tower of towers) {
    tower.update();
    tower.draw();
}


for (let projectile of projectiles) {
    projectile.update();
    projectile.draw();
}


    for (let enemy of enemies) {
        enemy.update();
        enemy.draw();
    }

    requestAnimationFrame(gameLoop);


// Add event listener for home button
const homeButton = document.getElementById("homeButton");
homeButton.addEventListener("click", function() {
    // Navigate to the home page
    window.location.href = "Portfolio.html";
});

const backgroundImage = new Image();
backgroundImage.src = "Elements/map.jpg"; // Replace "path/to/background_image.png" with the actual path to your background image

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBuildAreaBorder();

    visualEffects.forEach(effect => effect.update());
    visualEffects = visualEffects.filter(effect => effect.active);
    visualEffects.forEach(effect => effect.draw());

    enemies.forEach(enemy => { 
      enemy.update();
      enemy.draw()
    });
    towers.forEach(tower => {
        tower.update();
        tower.draw();
    });
    projectiles.forEach(projectile => {
        projectile.update();
        projectile.draw();
    });
    
    drawCastle();
    drawHearts();
    drawMessage();

    if (isPlayerDead) {
        ctx.font = "100px Chiller";
        ctx.fillStyle = "purple";
        ctx.textAlign = "center";
        ctx.fillText("YOU HAVE DIED!", canvas.width / 2, canvas.height / 2);
    }

    requestAnimationFrame(gameLoop);
}

init();
gameLoop();

