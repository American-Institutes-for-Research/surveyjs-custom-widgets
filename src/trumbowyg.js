function init(Survey, $) {
    const iconId = "icon-editor";
    const componentName = "trumbowyg";
    Survey.SvgRegistry && Survey.SvgRegistry.registerIconFromSvg(iconId, require('svg-inline-loader!./images/editor.svg'), "");
    $ = $ || window.$;
    var widget = {
        name: componentName,
        title: "Editor",
        iconName: iconId,
        widgetIsLoaded: function () {
            return typeof $.trumbowyg != "undefined";
        },
        isFit: function (question) {
            return question.getType() === componentName;
        },
        htmlTemplate:
            "<div></div>",
        activatedByChanged: function (activatedBy) {
            Survey.Serializer.addClass(componentName, [], null, "empty");
            let registerQuestion = Survey.ElementFactory.Instance.registerCustomQuestion;
            if (!!registerQuestion) registerQuestion(componentName);
            Survey.Serializer.addProperty(componentName, {
                name: "height",
                default: 300,
                category: "general",
            });
        },
        afterRender: function (question, el) {
            var name = question.inputId;
            el.name = name;
            $(el).trumbowyg('destroy');

            var $editor = $(el);

            MathJax.Hub.Config({
                tex2jax: {
                    inlineMath: [
                        ['$', '$'],
                        ['\\(', '\\)']
                    ]
                }
            });

            $editor.trumbowyg({
                btnsDef: {
                    // Create a new dropdown
                    image: {
                        dropdown: ['insertImage', 'base64'],
                        ico: 'insertImage'
                    }
                },
                btns: [
                    ['viewHTML'],
                    ['undo', 'redo'], // Only supported in Blink browsers
                    ['formatting'],
                    ['strong', 'em', 'del'],
                    ['superscript', 'subscript'],
                    ['link'],
                    ['image'],
                    ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
                    ['unorderedList', 'orderedList'],
                    ['horizontalRule'],
                    ['removeformat'],
                    ['mathlive'],
                    ['fullscreen']
                ],
                autogrow: true
            });

            if (question.isReadOnly) {
                $editor.trumbowyg('disable');
            } else {
                $editor.trumbowyg('enable');
            }

            var isValueChanging = false;
            var updateValueHandler = function () {

                if (isValueChanging || typeof question.value === "undefined") {
                    return;
                }

                $editor.trumbowyg('html', question.value);
            };

            $editor.on("tbwchange", function () {
                isValueChanging = true;
                question.value = $editor.trumbowyg('html');
                isValueChanging = false;
            });

            question.valueChangedCallback = updateValueHandler;
            question.readOnlyChangedCallback = function () {
                if (question.isReadOnly) {
                    $editor.trumbowyg('disable');
                } else {
                    $editor.trumbowyg('enable');
                }
            };
            updateValueHandler();
        },
        willUnmount: function (question, el) {
            question.readOnlyChangedCallback = null;
            $(el).trumbowyg('destroy');
            $(el).remove();
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
