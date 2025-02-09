import React from "react";
interface EditableTextAreaProps {
    initialValue: string;
    onUpdate: (value: string) => Promise<void>;
}
declare const EditableTextArea: React.FC<EditableTextAreaProps>;
export default EditableTextArea;
