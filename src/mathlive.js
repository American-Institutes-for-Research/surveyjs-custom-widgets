import mathlive from 'mathlivejs';

function init(Survey, $) {
    const iconId = "icon-editor";
    const componentName = "math";
    Survey.SvgRegistry && Survey.SvgRegistry.registerIconFromSvg(iconId, require('svg-inline-loader!./images/editor.svg'), ""); 
    $ = $ || window.$;
    var widget = {
        name: componentName,
        title: "Math Formula",
        iconName: iconId,
        widgetIsLoaded: function () {
           // debugger;
            return true;//typeof MathfieldElement. != "undefined";
        },
        isFit: function (question) {
            // debugger;
            return question.getType() === componentName;
            //return (question.getType() == "text" && question.inputType == "math")
        },
        htmlTemplate:
            '<math-field id="mf" style="display: block"></math-field>',
            activatedByChanged: function (activatedBy) {
            //debugger;
            Survey.Serializer.addClass(componentName, [], null, "empty");
            let registerQuestion = Survey.ElementFactory.Instance.registerCustomQuestion;
            if (!!registerQuestion) registerQuestion(componentName);
            Survey.Serializer.addProperty(componentName, {
                name: "math",
                type: "text",
                default: null,
                category: "general",
            });
        },
        afterRender: function (question, el) {
            debugger;
            var name = question.inputId;
            //$(el).remove();

            var propEditor = Survey.Serializer.findProperty("math", "math");
            var editor = el;// document.getElementById('mf');

            //$editor.name = name;

            //var editor = new MathLive.MathfieldElement();
            editor.setValue(question.value);
            editor.disabled = question.isReadOnly;

            //$editor.html(mfe);

/*            $editor.html(question.value);*/

            var isValueChanging = false;
            var updateValueHandler = function () {

                if (isValueChanging || typeof question.value === "undefined") {
                    return;
                }

                //$editor.html(question.value);
                editor.setValue(question.value);
                propEditor.value = question.value;
            };

            editor.addEventListener("change", function (event) {
                debugger;
                isValueChanging = true;
                question.value = editor.getValue();
                propEditor.value = editor.getValue();
                isValueChanging = false;
            });

            question.valueChangedCallback = updateValueHandler;
            question.readOnlyChangedCallback = function () {
                if (question.isReadOnly) {
                    //$editor.disable();
                    editor.disabled = true; 
                } else {
                    //$editor.enable();
                    editor.disabled = false;
                }
            };
            updateValueHandler();
        },
        willUnmount: function (question, el) {
            /*debugger;*/
            question.readOnlyChangedCallback = null;
            //$(el).trumbowyg('destroy');
            el.remove();
        },
        pdfRender: function (survey, options) {
            if (options.question.getType() === componentName) {
                const loc = new Survey.LocalizableString(survey, true);
                loc.text = options.question.value || options.question.defaultValue;
                options.question["locHtml"] = loc;
                if (
                    options.question.renderAs === "standard" ||
                    options.question.renderAs === "image"
                ) {
                    options.question["renderAs"] = options.question.renderAs;
                } else options.question["renderAs"] = "auto";
                const flatHtml = options.repository.create(
                    survey,
                    options.question,
                    options.controller,
                    "html"
                );
                return new Promise(function (resolve) {
                    flatHtml.generateFlats(options.point).then(function (htmlBricks) {
                        options.bricks = htmlBricks;
                        resolve();
                    });
                });
            }
        },
    };

    Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "customtype");
}

if (typeof Survey !== "undefined") {
    init(Survey, window.$);
}

export default init;
