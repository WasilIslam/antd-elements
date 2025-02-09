'use strict';

var React = require('react');
var antd = require('antd');

var TextArea = antd.Input.TextArea;
var TextAreaWithSaveCancel = function (_a) {
    var initialValue = _a.initialValue, onUpdate = _a.onUpdate;
    var _b = React.useState(initialValue), value = _b[0], setValue = _b[1];
    var _c = React.useState(false), isUpdated = _c[0], setIsUpdated = _c[1];
    var handleSave = function () {
        onUpdate(value).then(function () {
            setIsUpdated(false);
        });
    };
    var handleCancel = function () {
        setValue(initialValue);
        setIsUpdated(false);
    };
    var handleChange = function (e) {
        var newValue = e.target.value;
        setValue(newValue);
        setIsUpdated(newValue !== initialValue);
    };
    return (React.createElement("div", { style: { marginTop: 10 } },
        React.createElement(TextArea, { value: value, onChange: handleChange, rows: 4, placeholder: "Type something...", style: { width: "100%" } }),
        isUpdated && (React.createElement(antd.Space, { style: { display: "flex", justifyContent: "flex-end", marginTop: 5 } },
            React.createElement(antd.Button, { type: "primary", onClick: handleSave }, "Save"),
            React.createElement(antd.Button, { onClick: handleCancel }, "Cancel")))));
};

exports.TextAreaWithSaveCancel = TextAreaWithSaveCancel;
//# sourceMappingURL=index.cjs.js.map
