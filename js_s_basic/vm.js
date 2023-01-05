class VM{
    #stack_base_pos=0
    #stack=[];
    #code_buf=[];


    addStackPCmd(num){
        for (var i=0;i < num;++i){
            this.#code_buf.push(new AddStackPCmd());

        }
        
    }
    addCondGotoCmd(pos){
        this.#code_buf.push(new GotoCmd(GOTO_COND,pos));
    }
    addNotCmd(){
        this.#code_buf.push(new NotCmd());
    }
    addSetCmd(){
        this.#code_buf.push(new SetCmd());
    }
    get_code_buf_size(){
        return this.#code_buf.length;
    }
}