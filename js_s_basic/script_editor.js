
class ScriptEditor extends View{

    constructor(rootNode){
        super(rootNode);
        this.remove_child_nodes(rootNode);
        this.#create_editor(rootNode);   
    }

    #create_editor(rootNode){
        var form=document.createElement("form");
        var code_input_area=document.createElement("textarea");
        code_input_area.rows=24;
        code_input_area.cols=80;
        code_input_area.id="basic_code";
        code_input_area.appendChild(document.createTextNode(app.current_source_code));

        form.appendChild(code_input_area);
        form.appendChild(document.createElement("br"));
        var clear_button=document.createElement("input");
        clear_button.type="button";
        clear_button.value="Clear";
        form.appendChild(clear_button);
        var compile_button=document.createElement("input");
        compile_button.type="button";
        compile_button.value="Compile";
        compile_button.onclick=this.#on_compile_click;
        form.appendChild(compile_button);
        var import_source_button=document.createElement("input");
        import_source_button.type="button";
        import_source_button.value="Import";
        form.appendChild(import_source_button);

        rootNode.appendChild(form);

    }
    #on_compile_click(){
        var code_input_area=document.getElementById("basic_code");
        var basic_code=code_input_area.textContent;

        app.compile(basic_code);
    }
    
}