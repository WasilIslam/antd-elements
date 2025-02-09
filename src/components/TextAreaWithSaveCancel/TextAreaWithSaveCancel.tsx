import React, { useState } from "react";
import { Input, Button, Space } from "antd";

const { TextArea } = Input;

interface TextAreaWithSaveCancelProps {
  initialValue: string;
  onUpdate: (value: string) => Promise<void>;
}

const TextAreaWithSaveCancel: React.FC<TextAreaWithSaveCancelProps> = ({ initialValue, onUpdate }) => {
  const [value, setValue] = useState(initialValue);
  const [isUpdated, setIsUpdated] = useState(false);

  const handleSave = () => {
    onUpdate(value).then(() => {
      setIsUpdated(false);
    });
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsUpdated(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setIsUpdated(newValue !== initialValue);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <TextArea value={value} onChange={handleChange} rows={4} placeholder="Type something..." style={{ width: "100%" }} />
      {isUpdated && (
        <Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 5 }}>
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </Space>
      )}
    </div>
  );
};

export default TextAreaWithSaveCancel;
