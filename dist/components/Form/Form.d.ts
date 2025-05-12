import React from 'react';
interface FormGeneratorProps {
    value?: any[];
    onChange?: (fields: any[]) => void;
    isPreview?: boolean;
    onSubmitPreview?: (values: any) => void;
}
declare const AntdElementsForm: React.FC<FormGeneratorProps>;
export default AntdElementsForm;
