//création du canvas (représente l'aire de jeu)
window.onload = function(){
    const canvasWidth = 900;
    const canvasHeight = 600;
    const blockSize = 30;//taille d'un bloc
    //la pomme, le serpent et l'aire de jeu sont constitués de blocs (petits carrés)
    const canvas = document.createElement('canvas');
    const ctx= canvas.getContext('2d');
    const widthInBlocks = canvasWidth/blockSize;//largeur en block = largeur du canvas/taille d'un bloc
    const heightInBlocks = canvasHeight/blockSize;//hauteur en block = hauteur du canvas/taille d'un bloc
    const centreX = canvasWidth / 2;
    const centreY = canvasHeight / 2;
    let delay;
    let snakee;
    let applee; 
    let score;
    let timeOut;
    
    init();
    //initialisation du canvas
    function init(){
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid gray";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas);//ajoute le canvas au document html
        launch();
    }
    
    function launch(){ //quand j'appuie sur la touche espace du jeu, tout est recréé de 0
        snakee = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]],"right");
        applee = new Apple([10,10]);
        score = 0;
        clearTimeout(timeOut);
        delay = 100;
        refreshCanvas();
    }

    function refreshCanvas(){
        snakee.advance();//le serpent avance
        if (snakee.checkCollision()){ //si le serpent rencontre un obstacle
            gameOver(); //perdu
        } else {
            if (snakee.isEatingApple(applee)){ //si le serpent mange la pomme
                score++; //le joueur marque un point de plus
                snakee.ateApple = true;
                //chercher une nouvelle position pour la pomme, tant que la pomme est sur le serpent
                do {
                    applee.setNewPosition(); 
                } while(applee.isOnSnake(snakee));
                //si le score se divise par 5(à chaque palier de 5 points), augmenter la vitesse du jeu
                if(score % 5 == 0){
                    speedUp();
                }
            }
            ctx.clearRect(0,0,canvasWidth,canvasHeight);//remet le canvas à 0
            drawScore(); //affiche le score
            snakee.draw(); //affiche le serpent
            applee.draw(); //affiche la pomme
            timeOut = setTimeout(refreshCanvas,delay);//après un certain délai, rafrîchir le canvas
         }
    }
    
    function speedUp(){
        delay /= 2;
    }
    
    function gameOver(){
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.strokeText("Game Over", centreX, centreY - 180);
        ctx.fillText("Game Over", centreX, centreY - 180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        ctx.restore();
    }
    
    function drawScore(){ //affiche le score
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    }
    
    function drawBlock(ctx, position){ //pour dessiner un block
        const x = position[0]*blockSize;
        const y = position[1]*blockSize;
        ctx.fillRect(x,y,blockSize,blockSize);
    }
    
    function Snake(body, direction){ //fonction constructeur du serpent
        this.body = body; //corps du serpent
        this.direction = direction; //direction du serpent
        this.ateApple = false; //permet de savoir si le serpent a mangé la pomme
       
        //affiche le serpent sur le canvas
        this.draw = function(){ 
            ctx.save();
            ctx.fillStyle="#ff0000";
            for (let i=0 ; i < this.body.length ; i++){
                drawBlock(ctx,this.body[i]);
            }
            ctx.restore();
        };
        
        //pour faire avancer le serpent
        //change le corps du serpent en fonction de sa direction
        this.advance = function(){ 
            const nextPosition = this.body[0].slice();
            switch(this.direction){
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("invalid direction");
            }
            this.body.unshift(nextPosition); //si le serpent mange une pomme son corps devient plus long
            if (!this.ateApple)
                this.body.pop();
            else
                this.ateApple = false;
        };
        //vérifier la direction du serpent et l'autorise ou pas
        this.setDirection = function(newDirection){
            let allowedDirections;
            switch(this.direction){
                case "left":
                case "right":
                    allowedDirections=["up","down"];
                    break;
                case "down":
                case "up":
                    allowedDirections=["left","right"];
                    break;  
               default:
                    throw("invalid direction");
            }
            if (allowedDirections.indexOf(newDirection) > -1){
                this.direction = newDirection;
            }
        };
        //gérer les collisions dans un mur ou si le serpent se cogne dans son propre corps
        this.checkCollision = function(){
            let wallCollision = false;
            let snakeCollision = false;
            const head = this.body[0];
            const rest = this.body.slice(1);
            const snakeX = head[0];
            const snakeY = head[1];
            const minX = 0;
            const minY = 0;
            const maxX = widthInBlocks - 1;
            const maxY = heightInBlocks - 1;
            const isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            const isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
            
            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
                wallCollision = true;
            
            for (let i=0 ; i<rest.length ; i++){
                if (snakeX === rest[i][0] && snakeY === rest[i][1])
                    snakeCollision = true;
            }
            
            return wallCollision || snakeCollision;        
        };
        //vérifie si la tête du serpent a la m^me position que la pomme
        this.isEatingApple = function(appleToEat){
            const head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
            else
                return false;
        }
        
    }
    
    function Apple(position){
        this.position = position;
        //affiche une pomme dans le canvas
        this.draw = function(){
          const radius = blockSize/2;
          const x = this.position[0]*blockSize + radius;
          const y = this.position[1]*blockSize + radius;  
          ctx.save();
          ctx.fillStyle = "#33cc33";
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI*2, true);
          ctx.fill();
          ctx.restore();
        };
        //donne une nouvelle position à la pomme quand elle a été mangée
        this.setNewPosition = function(){
            const newX = Math.round(Math.random()*(widthInBlocks-1));
            const newY = Math.round(Math.random()*(heightInBlocks-1));
            this.position = [newX,newY];
        }; 
        
        this.isOnSnake = function(snakeToCheck){ //vérifie si la pomme est sur le serpent
            let isOnSnake = false;
            for (let i=0 ; i < snakeToCheck.body.length ; i++){
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
                    isOnSnake = true;     
                }
            }
            return isOnSnake;
        };

    }
    //capte les touches sur lesquelles appuie l'utilisateur
    document.onkeydown = function handleKeyDown(e){
        const key = e.keyCode;
        let newDirection;
        switch(key){
            case 37: //correspond à la flèche de gauche du clavier
                newDirection = "left";
                break;
            case 38:
                newDirection = "up"; //correspond à la flèche du haut du clavier
                break;
            case 39:
                newDirection = "right"; //correspond à la flèche de droite du clavier
                break;
            case 40:
                newDirection = "down"; //correspond à la flèche du bas du clavier
                break;
            case 32: //correspond à la touche espace du clavier
                launch();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    };
}