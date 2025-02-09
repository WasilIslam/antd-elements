import React from "react";
interface TextAreaWithSaveCancelProps {
    initialValue: string;
    onUpdate: (value: string) => Promise<void>;
}
declare const TextAreaWithSaveCancel: React.FC<TextAreaWithSaveCancelProps>;
export default TextAreaWithSaveCancel;
