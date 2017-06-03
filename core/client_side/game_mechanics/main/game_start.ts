
import {ClientSideGame} from './game';
import {Autowired} from "../experimental/decorators";
import {VariableContext} from "../experimental/context";
import {Drawer} from "../drawing/drawer";


export class GameStarter {
    @Autowired(VariableContext)
    private variableMap: VariableContext;
    private drawer: Drawer;

    public start(canvasId: string, mode: string, nicknames?: string[]) {
        const drawer = this.variableMap.get('drawer');
        if (!drawer) {
            this.variableMap.set('drawer', new Drawer(document.getElementById(canvasId) as HTMLCanvasElement));
            this.drawer = this.variableMap.get('drawer');
        } else {
            this.drawer = drawer;
            this.drawer.setCanvas(document.getElementById(canvasId) as HTMLCanvasElement);
        }

        const loop = new ClientSideGame(mode, nicknames);

        this.variableMap.set('loop', loop);

        loop.init();
        if (mode === 'single') {
            loop.start();
        }
    }
}
