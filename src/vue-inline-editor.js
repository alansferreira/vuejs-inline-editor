const $input = $('<input type="text" class="vue-inline-editor-input"/>');
$input.appendTo(document.body);

class EditableOptions{
    constructor(autoCommitOnBlur, autoHideOnBlur){
        
        this.autoCommitOnBlur = (autoCommitOnBlur==undefined? true: autoCommitOnBlur);
        this.autoHideOnBlur = (autoHideOnBlur==undefined? true: autoHideOnBlur);

    }
}


Vue.component('vie', {
    props: ['model', 'fieldName', 'groupName', 'autoCommitOnBlur', 'autoHideOnBlur'],
    template: "<span class='vue-inline-editor-static'>{{displayValue}}</span>",
    mounted: function () {
        const vm = this;
        this.options = new EditableOptions(this.autoCommitOnBlur, this.autoHideOnBlur);
        
        $(vm.$el)
            .on('click', vm.click)
            .data('__vie__', this)
        ;
        
        console.log(vm.$el.tabIndex);
    },
    computed: {
        displayValue: function (component) {
            return component.model[component.fieldName];
        }
    },
    methods: {
        click: function(event){
            this.startEdit();
        },
        
        startEdit: function(){
            this.bindInput();
        },
        cancelEdit: function(){
            this.unbindInput();
        },
        commitEdit: function(){
            this.model[this.fieldName] = $input.val();
        },
        
        bindInput: function(){            

            const $el = $(this.$el);
            $input.css({
              position: 'absolute',
              top: $el.offset().top + 'px',
              left: $el.offset().left + 'px', 
              "font-family": $el.css("font-family"), 
              "font-size": $el.css("font-size"), 
              "margin": $el.css("margin"), 
            });
            
            
            $input.width($el.width());
            $input.height($el.height());
            
            $input.val(this.model[this.fieldName]);

            $input.on('blur', this.$input_blur.bind(this));
            $input.on('keydown', this.$input_keydown.bind(this));
            $input.on('keyup', this.$input_keyup.bind(this));

            $input.show();
            $input.select();
        },
        unbindInput: function(){
            $input.unbind('blur');
            $input.unbind('keydown');
            $input.unbind('keyup');
            $input.hide();
        },
        $input_blur: function(){
            if(this.options.autoCommitOnBlur) this.commitEdit();
            if(this.options.autoHideOnBlur) this.unbindInput();
            
            console.log('$input_blur');
        },
        $input_keydown: function(ev){
            switch(ev.keyCode){
                case 27: //ESCAPE
                  return this.cancelEdit();
                case 9:

                    ev.preventDefault();
                    ev.stopPropagation();
                    ev.cancelBubble=true;
        
                    // const $vie = $(ev.currentTarget).data('__vie__');
                    const $el = $(this.$el);
                    const arr = $('.vue-inline-editor-static', $el.parent()).toArray();
                    var index = arr.indexOf(this.$el);
                    if(!ev.shiftKey){
                        if(index == arr.length-1) {
                            index = 0;
                        } else {
                            index ++;
                        }
                    } else {
                        if(index == 0) {
                            index = arr.length - 1;
                        } else {
                            index --;
                        }
                    }

                    this.commitEdit();
                    this.unbindInput();
                    // setTimeout(function (){
                        $(arr[index]).data('__vie__').startEdit();
                    // }, 20);
              }
        
            console.log('$input_keydown');
        },
        $input_keyup: function(){
            console.log('$input_keyup');
        },
    }
});
