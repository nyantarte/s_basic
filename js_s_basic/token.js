class Token{
    token="";
    lno=0;

    constructor(t,ln){
        this.token=t;
        this.lno=ln;
    }
}
class TokenIterator{

    #target_tokens=[];
    #cur_pos=0;
    constructor(targets){
        this.#target_tokens=targets;
    }


    isEnd(){
        return this.#cur_pos!=this.#target_tokens.length;
    }
    isLineEnd(){
        return this.isEnd() || this.#target_tokens[this.#cur_pos].lno!=this.#target_tokens[this.#cur_pos+1].lno;
    }
    get(){
        return this.#target_tokens[this.#cur_pos++].token;
    }
    peek(){
        return this.#target_tokens[this.#cur_pos];
    }

}