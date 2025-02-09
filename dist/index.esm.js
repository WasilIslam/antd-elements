import React, { useState } from 'react';
import { Input, Space, Button } from 'antd';

var TextArea = Input.TextArea;
var TextAreaWithSaveCancel = function (_a) {
    var initialValue = _a.initialValue, onUpdate = _a.onUpdate;
    var _b = useState(initialValue), value = _b[0], setValue = _b[1];
    var _c = useState(false), isUpdated = _c[0], setIsUpdated = _c[1];
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
        isUpdated && (React.createElement(Space, { style: { display: "flex", justifyContent: "flex-end", marginTop: 5 } },
            React.createElement(Button, { type: "primary", onClick: handleSave }, "Save"),
            React.createElement(Button, { onClick: handleCancel }, "Cancel")))));
};

export { TextAreaWithSaveCancel };
//# sourceMappingURL=index.esm.js.map
