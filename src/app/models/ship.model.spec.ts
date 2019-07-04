import { Ship } from './ship.model';
import { GameObject } from './game-object.model';
import { Vect2D } from './vect2D.model';
import { FactoryADN } from '../ia/adn';

const adnFactory = new FactoryADN();

describe('Ship', () => {
  describe('isInView', () => {
    it('outputs true if the object is in view of the ship', () => {
        const s = new Ship(1, 1, 1, 1, adnFactory, false, null, null, [], [-1]);
        s.setPosition(new Vect2D(100, 100));
        s.setOrientation(0);
        s.setFOV(120);
        
        const go = new GameObject(2);
        go.setPosition(new Vect2D(130, 100));

        expect(s.isInView(go));
    });

    it('outputs true if the object is in view of the ship 2', () => {
        const s = new Ship(1, 1, 1, 1, adnFactory, false, null, null, [], [-1]);
        s.setPosition(new Vect2D(100, 100));
        s.setOrientation(0);
        s.setFOV(120);

        const go = new GameObject(2);
        go.setPosition(new Vect2D(100, 100));

        expect(s.isInView(go));
    });

    it('outputs true if the object is in view of the ship limit case', () => {
        const s = new Ship(1, 1, 1, 1, adnFactory, false, null, null, [], [-1]);
        s.setPosition(new Vect2D(100, 100));
        s.setOrientation(0);
        s.setFOV(120);

        const go = new GameObject(2);
        go.setPosition(new Vect2D(130, -6.5));
        expect(s.isInView(go));

        const go2 = new GameObject(2);
        go2.setPosition(new Vect2D(130, 166));
        expect(s.isInView(go2));
    });

    it('outputs alse if the object is outside the view of the ship 1', () => {
        const s = new Ship(1, 1, 1, 1, adnFactory, false, null, null, [], [-1]);
        s.setPosition(new Vect2D(100, 100));
        s.setOrientation(0);
        s.setFOV(120);

        const go = new GameObject(2);
        go.setPosition(new Vect2D(-100, 100));

        expect(s.isInView(go));
    });

    it('outputs alse if the object is outside the view of the ship 2', () => {
        const s = new Ship(1, 1, 1, 1, adnFactory, false, null, null, [], [-1]);
        s.setPosition(new Vect2D(100, 100));
        s.setOrientation(0);
        s.setFOV(120);

        const go = new GameObject(2);
        go.setPosition(new Vect2D(100, 50));

        expect(s.isInView(go));
    });

    it('outputs alse if the object is outside the view of the ship 2', () => {
        const s = new Ship(1, 1, 1, 1, adnFactory, false, null, null, [], [-1]);
        s.setPosition(new Vect2D(100, 100));
        s.setOrientation(0);
        s.setFOV(120);

        const go = new GameObject(2);
        go.setPosition(new Vect2D(100, 150));

        expect(s.isInView(go));
    });

    it('outputs false if the object is in view of the ship limit case', () => {
        const s = new Ship(1, 1, 1, 1, adnFactory, false, null, null, [], [-1]);
        s.setPosition(new Vect2D(100, 100));
        s.setOrientation(0);
        s.setFOV(120);

        const go = new GameObject(2);
        go.setPosition(new Vect2D(130, -7));
        expect(!s.isInView(go));

        const go2 = new GameObject(2);
        go2.setPosition(new Vect2D(130, 167));
        expect(!s.isInView(go2));
    });
  });
});