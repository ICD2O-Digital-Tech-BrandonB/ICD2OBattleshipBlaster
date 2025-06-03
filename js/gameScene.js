// Created by: BrandonBCode
// Created on: May 2025
// This is the Menu scene for the game

/**
 * This class is the splash scene for the game
 */
class GameScene extends Phaser.Scene {
    
    // Method to create a new alien at a random x position and with random x velocity
    createAlien() {
        const alienXLocation = Math.floor(Math.random() * 1920) + 2
        let alienXVelocity = Math.floor(Math.random() * 50) + 2
        alienXVelocity *= Math.round(Math.random()) ? 1 : -1
        const anAlien = this.physics.add.sprite(alienXLocation, -99, 'alien')
        anAlien.body.velocity.y = 200
        anAlien.body.velocity.x = alienXVelocity
        this.alienGroup.add(anAlien)
    }

    constructor() {
        super({ key: 'gameScene' });

        // Initialize game variables and styles
        this.background = null
        this.ship = null
        this.fireMissile = false
        this.isGameOver = false
        this.score = 0
        this.scoreText = null
        this.scoreTextStyle = { font: '65px Arial', fill: '#ffffff', align: 'center' }
        
        this.gameOverText = null
        this.gameOverTextStyle = { font: '65px Arial', fill: '#ff0000', align: 'center' }

        this.powerText = null
        this.powerTextStyle = { font: '40px Arial', fill: '#ff0000', align: 'center' }
    }
  
    // Set background color when scene is initialized
    init(data) {
        this.cameras.main.setBackgroundColor("AEA04B");
    }
  
    // Preload assets (images and sounds)
    preload() {
        console.log('Game Scene');

        this.load.image('starBackground', 'assets/starBackground.png')
        this.load.image('ship', 'assets/spaceShip.png')
        this.load.image('missile', 'assets/missile.png')
        this.load.image('alien', 'assets/alien.png')
        this.load.image('explosion', 'assets/explosion.gif')
        // sound
        this.load.audio('laser', 'assets/laser1.wav')
        this.load.audio('explosion', 'assets/barrelExploding.wav')
        this.load.audio('bomb', 'assets/bomb.wav')
    }

    // Create game objects and set up collisions
    create(data) {
        this.fireMissile = false
        this.isGameOver = false
        this.score = 0

        // Add background image
        this.background = this.add.image(0, 0, 'starBackground').setScale(2.0)
        this.background.setOrigin(0, 0)

        // Add score text
        this.scoreText = this.add.text(10, 10, 'Score: ' + this.score.toString(), this.scoreTextStyle)

        // Add player ship
        this.ship = this.physics.add.sprite(1920 / 2, 1080 - 100, 'ship')

        // Create groups for missiles and aliens
        this.missileGroup = this.physics.add.group()
        this.alienGroup = this.add.group()

        // Spawn the first alien
        this.createAlien()

        // Handle missile and alien collision
        this.physics.add.overlap(this.missileGroup, this.alienGroup, function (missileCollide, alienCollide) {
            // Create an explosion sprite at the alien's position
            const explosion = this.add.sprite(alienCollide.x, alienCollide.y, 'explosion')
            explosion.setScale(0.3)
            this.sound.play('explosion')
            // Optional: destroy explosion after a short time  (500ms)
            this.time.delayedCall(500, () => {
                explosion.destroy()
            })

            alienCollide.destroy()
            missileCollide.destroy()
            this.score = this.score + 1
            this.scoreText.setText('Score: ' + this.score.toString())
            this.createAlien()
            this.createAlien()
        }.bind(this))
    
        // Handle ship and alien collision (game over)
        this.physics.add.collider(this.ship, this.alienGroup, function (shipCollide, alienCollide) {
            this.sound.play('bomb')
            this.physics.pause()
            alienCollide.destroy()
            shipCollide.destroy()
            this.isGameOver = true
            this.gameOverText = this.add.text(1920 / 2, 1080 / 2, 'Game Over!\nClick to play again.', this.gameOverTextStyle).setOrigin(0.5)
            this.gameOverText.setInteractive({ useHandCursor: true })
            this.gameOverText.on('pointerdown', () => this.scene.start('gameScene'))
        }.bind(this))
    }
    
    // Main game loop, called every frame
    update(time, delta) {
        if (this.isGameOver) {
            return
        }
        
        // Keyboard input setup
        const keyLeftObj = this.input.keyboard.addKey('LEFT')
        const keyRightObj = this.input.keyboard.addKey('RIGHT')
        const keyUpObj = this.input.keyboard.addKey('UP')
        const keyDownObj = this.input.keyboard.addKey('DOWN')
        const keySpaceObj = this.input.keyboard.addKey('SPACE')

        // Move ship up
        if (keyUpObj.isDown === true) {
            this.ship.y -= 15
            if (this.ship.y < 0) {
                this.ship.y = 1080
            }
        }

        // Move ship down
        if (keyDownObj.isDown === true) {
            this.ship.y += 15
            if (this.ship.y > 1080) {
                this.ship.y = 0
            }
        }

        // Move ship left
        if (keyLeftObj.isDown === true) {
            this.ship.x -= 15
            if (this.ship.x < 0) {
                this.ship.x = 1920
            }
        }
        
        // Move ship right
        if (keyRightObj.isDown === true) {
            this.ship.x += 15
            if (this.ship.x > 1920) {
                this.ship.x = 0
            }
        }

        // Fire missile if space is pressed
        if (keySpaceObj.isDown === true) {
            if (this.fireMissile === false && !this.isGameOver) {
                this.fireMissile = true
                const aNewMissile = this.physics.add.sprite(this.ship.x, this.ship.y, 'missile')
                this.missileGroup.add(aNewMissile)
                this.sound.play('laser')
            }
        }

        // Allow firing again when space is released
        if (keySpaceObj.isUp === true) {
            this.fireMissile = false
        }

        // Move all missiles up the screen
        this.missileGroup.children.each(function (item) {
            item.y = item.y - 15
            if (item.y < 0) {
                item.destroy()
            }
        })

        // Power-up logic: activate when score is 15
        if (this.score === 15) {
            // Show power-up text if not already shown
            if (!this.powerText) {
                this.powerText = this.add.text(1920 / 2, 100, 'Power Up!', this.powerTextStyle).setOrigin(0.5)
                // Remove power-up text after 7 seconds
                this.time.delayedCall(7000, () => {
                    if (this.powerText) {
                        this.powerText.destroy()
                        this.powerText = null
                    }
                })
            }

            // Speed up missiles during power-up
            this.missileGroup.children.each(function (item) {
                item.y = item.y - 35
                if (item.y < 0) {
                    item.destroy()
                }
            })

            // Reset aliens to top if they go off the bottom
            this.alienGroup.children.each(function (alien) {
                if (alien.y > 1080) {
                    alien.y = -99
                    alien.x = Math.floor(Math.random() * 1920) + 2
                }
            }, this)
        } else {
            // Remove powerText if score drops below 15
            if (this.powerText) {
                this.powerText.destroy()
                this.powerText = null
            }
        }
    }
}

export default GameScene
