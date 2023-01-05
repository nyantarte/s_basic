
const BASIC_VALUE_ERROR=-2;
const BASIC_VALUE_UNKNOWN=BASIC_VALUE_ERROR+1;
const BASIC_VALUE_STRING=BASIC_VALUE_UNKNOWN+1;
const BASIC_VALUE_INT=BASIC_VALUE_STRING+1;
const BASIC_VALUE_VAR=BASIC_VALUE_INT+1;
class BasicValue{
    #type=BASIC_VALUE_UNKNOWN;
    #value=null;


    constructor(_type,_value){
        this.#type=_type;
        this.#value=_value;
    }
}
class Namespace{
    #name_tbl=[];

    isExist(name){
        return -1!=this.#name_tbl.indexOf(name);
    }


    regist(name,obj){
        var t=BASIC_VALUE_UNKNOWN;
        if("number"==typeof(obj)){
            t=BASIC_VALUE_INT;
        }else if("string"==typeof(obj)){
            t=BASIC_VALUE_STRING;
        }
        this.#name_tbl[name]=new BasicValue(t,obj);
    }
    regist_type(name,t){
        this.#name_tbl[name]=new BasicValue(t,null);
    }

    get(name){
        return this.#name_tbl[name];
    }

}



class BasicParser{
    #current_sorce_code="";
    #current_name_space=new Namespace();
    #target_vm=null;
    #label_ref_tbl=[];
    compile(source_code,vm){
        var it=new TokenIterator(this.#parse_tokens());
        this.#target_vm=vm;
        this.#parse_module(it);
    }


    #parse_tokens(){
        var tokens=[];

        var lno=1;
        var isQuoted=false;
        var isDigit=false;
        var isLetter=false;
        for(var i=0;i < this.current_source_code.length;++i){
            var c=this.current_source_code.charAt(i);
            if(isQuoted){
                if("\""!=c){
                    tokens[tokens.length-1].token.concat(c);

                }else{
                    isQuoted=false;
                }
            }else{
                if(isDigit ){
                    if(c.match("[0-9]")){
                        tokens[tokens.length-1].token=tokens[tokens.length-1].token.concat(c);
                        continue;
                    }else{
                        isDigit=false;
                    }
                }else if(isLetter){
                    if(c.match("[A-Za-z]")){
                        tokens[tokens.length-1].token=tokens[tokens.length-1].token.concat(c);
                        continue;
                    }else{
                        tokens[tokens.length-1].token=tokens[tokens.length-1].token.toLowerCase();
                        isLetter=false;
                    }
                }

                if(" "==c || "\t"==c || "\r"==c){
                    continue;
                }else if("\n"==c){
                    ++lno;
                    continue;
                }else if("="==c || "["==c || "]"==c || "+"==c || "-"==c || "/"==c || "*"==c){
                    tokens.push(new Token(c,lno));
                }else if("<"==c){
                    if(">"==this.#current_sorce_code.charAt(i+1)){
                        var c1=this.#current_sorce_code.charAt(i++);
                        tokens.push(new Token(c+c1,lno));
                        continue;
                    }            
                    tokens.push(new Token(c,lno));

                }else if(">"==c){
                    tokens.push(new Token(c,lno));

                }
                else if("\""==c){
                    isQuoted=true;
                    tokens.push(new Token(c,lno));
                    tokens.push(new Token("",lno));
                }else if(c.match("[0-9]")){
                    isDigit=true;
                    tokens.push(new Token(c,lno));
                    
                }else if(c.match("[A-Za-z]")){
                    isLetter=true;
                    tokens.push(new Token(c,lno));

                }


            }
        }
        
        return tokens;
    }
    
    #parse_module(token_it){
        while(token_it.isEnd()){
            this.#parse_statement(token_it);        
        }
    }
    #parse_statement(token_it){
        var tok=token_it.get();
        if("dim"==tok){
            
            this.#parse_dim(token_it);
        }else if("if"==tok){
            this.#parse_if_state(token_it);
        }else if("while"==tok){
            this.#parse_while_state(token_it);
        }else if("loop"==tok){
            this.#parse_loop_state(token_it);

        }
        else{
            this.#parse_assign_expr(token_it);
        }

    }
    #parse_dim(token_it){
        var name=token_it.peek();
        console.assert(!this.#current_name_space.isExist(name));
        this.#target_vm.addStackPCmd(1);
        if(token_it.isLineEnd()){
            token_it.get();
            this.#current_name_space.regist(name,0);
        }else{
            console.assert("="==token_it.get());
            
            this.#current_name_space.regist_type(name,this.#parse_assign_expr(token_it));
        }
        
        return true;
    }
    #parse_if_state(token_it){
        this.#parse_bool_expr(token_it);
        console.assert("then"!=token_it.get());
        this.#target_vm.addNotCmd();
        var label_ref_idx=this.#label_ref_tbl.length;
        this.#label_ref_tbl.push(this.#target_vm.get_code_buf_size());
        this.#target_vm.addCondGotoCmd(-1);

        while("endif"!=token_it.peek()){
            this.#parse_statement(token_it);
        }
        this.#label_ref_tbl[label_ref_idx]=this.#target_vm.get_code_buf_size();
    }
    #parse_while_state(token_it){
        this.#parse_bool_expr(token_it);
        console.assert(token_it.isLineEnd());
        this.#target_vm.addNotCmd();
        var label_ref_idx=this.#label_ref_tbl.length;
        this.#label_ref_tbl.push(this.#target_vm.get_code_buf_size());
        this.#target_vm.addCondGotoCmd(-1);

        while("wend"!=token_it.peek()){
            this.#parse_statement(token_it);
        }
        this.#label_ref_tbl[label_ref_idx]=this.#target_vm.get_code_buf_size();

    }
    #parse_loop_state(token_it){
        console.assert(token_it.isLineEnd());
        this.#target_vm.addNotCmd();
        var loop_bgn_pos=this.#target_vm.get_code_buf_size();
        while("until"!=token_it.peek()){
            this.#parse_statement(token_it);
        }
        this.#parse_bool_expr(token_it);
        this.#target_vm.addCondGotoCmd(loop_bgn_pos);

    }
    #parse_assign_expr(token_it){
        var ident=token_it.get();
        if(token_it.isLineEnd()){
            return r_type;
        }
        console.assert(this.#current_name_space.isExist(ident));
        this.#target_vm.addPushVarCmd(this.#current_name_space.get(ident).value);
        var op=token_it.get();
        console.assert("="==op);
        this.#parse_bool_expr(token_it);
        this.#target_vm.addSetCmd();
        return r_type;

    }
    #parse_value(token_it){
        var tok=it.get();
        var r_type=BASIC_VALUE_ERROR;
        if(tok.match("[0-9]+")){
            r_type=BASIC_VALUE_INT;
        }else if(tok.match("[A-Za-z]+")){
            r_type=this.#current_name_space.regist_type(tok);
        }else if("("==tok){
            r_type=this.#parse_bool_expr(token_it);
            console.assert(")"==token_it.get());
        }else{
            console.assert(false);
        }
        return r_type;

    }
    #parse_bool_expr(token_it){
        var r_type=this.#parse_cmp_expr(token_it);
        while(!token_it.isLineEnd()){
            if(")"==token_it.peek())
                break;
            var op=token_it.get();
            console.assert("and"==op || "or"==op);
            this.#parse_cmp_expr(token_it);
        }        
        return r_type;
    }
    #parse_cmp_expr(token_it){
        var r_type=this.#parse_math_expr(token_it);
        if(token_it.isLineEnd()){
            return r_type;
        }    
        var op=token_it.get();
        console.assert("<"==op || ">"==op || "="==op || "<>"==op);
        this.#parse_math_expr(token_it);
        return r_type;
    }
    #parse_math_expr(token_it){
        return this.#parse_add_sub_expr(token_it);
    }

    #parse_add_sub_expr(token_it){
        var r_type=this.#parse_mul_div_expr(token_it);
        while(!token_it.isLineEnd()){
            var op=token_it.get();
            if("+"!=op && "-"!=op)
                break;

            this.#parse_mul_div_expr(token_it);
        }
        return r_type;
    }
    #parse_mul_div_expr(token_it){
        var r_type=this.#parse_value(token_it);
        while(!token_it.isLineEnd()){
            var op=token_it.get();
            if("*"!=op && "/"!=op)
                break;

            this.#parse_value(token_it);
        }
        return r_type;
    }

}