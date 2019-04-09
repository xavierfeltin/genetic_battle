export class PhysicsEngine {
    
    public static getVeloFromAngle(angle: number, speed: number): number[] {
        let rad = angle * Math.PI / 180
        let vx = Math.cos(rad) * speed;
        let vy = Math.sin(rad) * speed;
        return [vx, vy];
    }

    public static move(x: number, y: number, vx: number, vy: number, width: number, height: number, borders: number[], t: number): number[] {
        let w = width / 2;
        let h = height / 2;
        
        let newX = x + vx * t;
        if (newX - w < borders[0]) {newX = borders[0] + w;}
        else if (newX + w > borders[1]) {newX = borders[1] - w;}

        let newY = y + vy * t;
        if (newY - h < borders[2]) {newY = borders[2] + h;}
        else if (newY + h > borders[3]) {newY = borders[3] - h;}

        //console.log(newX + ', ' + newY);

        return [newX, newY];
    }

    public static getHeading(x: number, y: number): number {
        return Math.atan2(y, x) * 180 / Math.PI;
    }
}