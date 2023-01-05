class BasicCmd{

}

class AddStackPCmd extends BasicCmd{

}

const GOTO_ALWAYS=0;
const GOTO_COND=GOTO_ALWAYS+1;
const GOTO_L=GOTO_COND+1;
const GOTO_LE=GOTO_L+1;
const GOTO_E=GOTO_LE+1;
const GOTO_G=GOTO_EQ+1;
const GOTO_GE=GOTO_G+1;
class GotoCmd extends BasicCmd{

    mode=GOTO_ALWAYS;
    pos=0;

    constructor(_mode,_pos){
        this.mode=_mode;
        this.pos=_pos;
    }
}
class NotCmd extends BasicCmd{

}
class SetCmd extends BasicCmd{
    
}