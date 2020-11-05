const $input = $('<input type="text" class="vue-inline-editor-input"/>');
$(function(){
    $input.appendTo(document.body);
});


class EditableOptions{
    constructor(autoCommitOnBlur, autoHideOnBlur, endEditOnTabEdges){
        
        this.autoCommitOnBlur = (autoCommitOnBlur==undefined? true: autoCommitOnBlur);
        this.autoHideOnBlur = (autoHideOnBlur==undefined? true: autoHideOnBlur);
        this.endEditOnTabEdges = (endEditOnTabEdges==undefined? true: endEditOnTabEdges);
    }
}

let lastStoppedEdgeEventBreak = null;

Vue.component('vie', {
    props: ['model', 
            'fieldName', 
            'groupSelector', 
            'autoCommitOnBlur', 
            'autoHideOnBlur', 
            'endEditOnTabEdges',
            ''
    ],
    template: "<span class='vue-inline-editor-static'>{{displayValue}}</span>",
    mounted: function () {
        const vm = this;
        this.options = new EditableOptions(this.autoCommitOnBlur, this.autoHideOnBlur, this.endEditOnTabEdges);
        
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
        endEdit: function(){
            this.unbindInput();
        },
        commitEdit: function(){
            const oldValue = this.model[this.fieldName];
            const newValue = $input.val();

            if(oldValue==newValue) return;

            this.model[this.fieldName] = newValue;

            try { this.$emit('commit', this, oldValue, newValue); } catch (error) { }
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
        },
        $input_keydown: function(ev){
            if(this['handle_input_keydown_' + ev.keyCode]) return this['handle_input_keydown_' + ev.keyCode](ev);        
        },
        $input_keyup: function(){
            console.log('$input_keyup');
        },
        handle_input_keydown_27: function(ev){
            return this.endEdit();
        },
        handle_input_keydown_13: function(ev){
            ev.preventDefault();
            ev.stopPropagation();
            ev.cancelBubble=true;

            this.commitEdit();
            this.endEdit();

        },
        handle_input_keydown_9: function(ev){
            ev.preventDefault();
            ev.stopPropagation();
            ev.cancelBubble=true;
            
            const nextIndex = this.getIndex() + (!ev.shiftKey ? 1: -1);

            this.navigateTo(nextIndex);

        },
        getGroupSiblings: function(){
            return $(this.groupSelector).toArray();
        },
        getIndex: function(){
            return this.getGroupSiblings().indexOf(this.$el);
        },
        navigateTo(nextIndex){
            const $el = $(this.$el);
            const arr = this.getGroupSiblings();
            const currentIndex = arr.indexOf(this.$el);
            // let nextIndex = currentIndex + (!ev.shiftKey ? 1: -1);

            const outOfEdges = (nextIndex < 0 || nextIndex > arr.length-1);
            
            if(this.options.autoCommitOnBlur) {
                this.commitEdit();
            }
            if(outOfEdges && this.options.endEditOnTabEdges) {
                
                // if(lastStoppedEdgeEventBreak == this) return;
                // lastStoppedEdgeEventBreak = this;
                return this.$emit('stoped-on-edge', {
                    vie: this,
                    index: currentIndex
                });
            }
            if(outOfEdges) nextIndex = (nextIndex < 0 ? arr.length - 1 : 0);

            const $nextEl = $(arr[nextIndex]);
            this.endEdit();
            $nextEl.data('__vie__').startEdit();
        },

    }
});
