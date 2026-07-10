import hooks from "../../../hooks";
import mathUtils from "../../../utils/mathUtils";
import Module from "../../Module";

export default class Killaura extends Module {
    constructor() {
        super("Killaura", "Combat", {
            "Delay": 100,
            "Auto Block": "true"
        });

        this.lastExecutionTime = null;
        this.blocking = false;
    }

    ignoreEntities = ["EntityItem", "EntityXPOrb"]

    afterTick() {
        const currentTime = Date.now();
        if (currentTime - this.lastExecutionTime >= this.options["Delay"]) {
            this.lastExecutionTime = currentTime;
            this.tryKill();
        }
    }

    block () {
        hooks.game.controller.sendUseItem(hooks.game.player, hooks.game.world, hooks.game.player.inventory.getCurrentItem());
        this.blocking = true;
    }

    unblock () {
        hooks.game.controller.onStoppedUsingItem(hooks.game.player);
        this.blocking = false;
    }

    tryKill () {
        let attacked = false;
        let itemType = ballcrack.hooks.game.player.inventory.getCurrentItem()?.item?.constructor?.name;
        let autoBlock = this.options["Auto Block"] == "true";

        if (itemType !== "ItemSword") autoBlock = false;

        hooks.game.world.loadedEntityList.forEach(ent => {
            const dist = mathUtils.distanceBetween(ent.pos, hooks.game.player.pos);
            const box = ent.getEntityBoundingBox();
            if (hooks.game.player.id !== ent.id && dist < 14 && !this.ignoreEntities.includes(ent.constructor.name)) {
                attacked = true;

                if (autoBlock) this.unblock();
                hooks.game.controller.objectMouseOver.hitVec = hooks.game.player.pos.clone().clamp(box.min, box.max);
                hooks.game.controller.attackEntity(ent);
                if (autoBlock) this.block();

            }
        })

        if (!attacked) {
            if (autoBlock) this.unblock();
        }
    }
}