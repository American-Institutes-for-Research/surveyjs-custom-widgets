const CUSTOM_TYPE = "math";

function init(Survey) {
    const iconId = "icon-math";
    const componentName = "math";
    Survey.SvgRegistry && Survey.SvgRegistry.registerIconFromSvg(iconId, require('svg-inline-loader!./images/math.svg'), "");

    var widget = {
        name: componentName,
        title: "Math Formula",
        iconName: iconId,
        widgetIsLoaded: function () {
            return true;//typeof MathfieldElement. != "undefined";
        },
        isFit: function (question) {
            return question.getType() === componentName;
        },
        htmlTemplate:
          '<math-field id="mf-" style="display: block" class="sd-input"></math-field>',
        activatedByChanged: function (activatedBy) {
            Survey.Serializer.addClass(componentName, [], null, "empty");
            let registerQuestion = Survey.ElementFactory.Instance.registerCustomQuestion;
            if (!!registerQuestion) registerQuestion(componentName);

            //Survey.Serializer.addProperty(componentName, {
            //    name: componentName,
            //    category: "general"
            //});
        },
        afterRender: function (question, el) {
            var name = question.inputId;

            //var property = Survey.Serializer.findProperty("math", "math");
            var editor = el;

            editor.id = editor.id + question.id;

            editor.setValue(question.value);
            editor.disabled = question.isReadOnly;

            var isValueChanging = false;
            var updateValueHandler = function () {

                if (isValueChanging || typeof question.value === "undefined") {
                    return;
                }

                editor.setValue(question.value);
            };

            editor.addEventListener("change", function (event) {
                isValueChanging = true;
                question.value = event.target.getValue();
                isValueChanging = false;
            });

            question.valueChangedCallback = updateValueHandler;
            question.readOnlyChangedCallback = function () {
                if (question.isReadOnly) {
                    editor.disabled = true;
                } else {
                    editor.disabled = false;
                }
            };
            updateValueHandler();
        },
        willUnmount: function (question, el) {
            question.readOnlyChangedCallback = null;
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

    SurveyCreatorCore.PropertyGridEditorCollection.register({
         fit: function (prop) {
             return prop.type == "math";
         },
         getJSON: function (obj, prop, options) {
             return {
                 type: "math",
             };
         }
    });
}

if (typeof Survey !== "undefined") {
    init(Survey);
}

export default init;
