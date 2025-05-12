import React, { useState } from 'react';
import { Form, Input, Button, Space, Modal, Select, Checkbox, Radio, InputNumber, Switch, Card, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

const { TextArea } = Input;
const { Option } = Select;

// Field types
const FIELD_TYPES = {
  INPUT: 'input',
  TEXTAREA: 'textarea',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  NUMBER: 'number',
  SELECT: 'select',
};

// Initial field structure
const getInitialField = () => ({
  id: uuidv4(),
  type: FIELD_TYPES.INPUT,
  label: '',
  placeholder: '',
  required: false,
  instructions: '',
  options: ['Option 1'], // For checkbox, radio, select
  minValue: 0, // For number
  maxValue: 100, // For number
});

interface FormGeneratorProps {
  value?: any[];
  onChange?: (fields: any[]) => void;
  isPreview?: boolean;
  onSubmitPreview?: (values: any) => void;
}

const AntdElementsForm: React.FC<FormGeneratorProps> = ({
  value = [],
  onChange,
  isPreview = false,
  onSubmitPreview,
}) => {
  const [fields, setFields] = useState<any[]>(value);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState(getInitialField());
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [previewForm] = Form.useForm();
  const [localPreview, setLocalPreview] = useState(false);

  // Display either the passed isPreview prop or local preview state
  const showPreview = isPreview || localPreview;

  // Update fields and trigger onChange
  const updateFields = (newFields: any[]) => {
    setFields(newFields);
    if (onChange) {
      onChange(newFields);
    }
  };

  // Add a new field
  const handleAddField = () => {
    form.validateFields().then((values) => {
      const newField = { ...currentField, ...values };
      
      if (isEditing) {
        const updatedFields = fields.map(field => 
          field.id === newField.id ? newField : field
        );
        updateFields(updatedFields);
      } else {
        updateFields([...fields, newField]);
      }
      
      setIsModalVisible(false);
      setCurrentField(getInitialField());
      form.resetFields();
      setIsEditing(false);
    });
  };

  // Delete a field
  const handleDeleteField = (id: string) => {
    const updatedFields = fields.filter(field => field.id !== id);
    updateFields(updatedFields);
  };

  // Edit a field
  const handleEditField = (field: any) => {
    setCurrentField(field);
    setIsEditing(true);
    setIsModalVisible(true);
    form.setFieldsValue(field);
  };

  // Move field up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newFields = [...fields];
    [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    updateFields(newFields);
  };

  // Move field down
  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    const newFields = [...fields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    updateFields(newFields);
  };

  // Handle option changes for multi-choice fields
  const handleOptionChange = (options: string[]) => {
    setCurrentField({ ...currentField, options });
  };

  // Add a new option
  const handleAddOption = () => {
    const options = [...currentField.options, `Option ${currentField.options.length + 1}`];
    handleOptionChange(options);
  };

  // Remove an option
  const handleRemoveOption = (index: number) => {
    const options = currentField.options.filter((_: any, i: number) => i !== index);
    handleOptionChange(options);
  };

  // Handle option text change
  const handleOptionTextChange = (index: number, value: string) => {
    const options = [...currentField.options];
    options[index] = value;
    handleOptionChange(options);
  };

  // Handle preview form submission
  const handlePreviewSubmit = (values: any) => {
    if (onSubmitPreview) {
      onSubmitPreview(values);
    }
  };

  // Render field in preview mode
  const renderPreviewField = (field: any) => {
    const { type, label, placeholder, required, instructions, options, minValue, maxValue } = field;
    
    const formItemProps = {
      label,
      name: field.id,
      required,
      tooltip: instructions || undefined,
      style: { width: '100%' },
    };

    switch (type) {
      case FIELD_TYPES.INPUT:
        return (
          <Form.Item {...formItemProps}>
            <Input placeholder={placeholder} style={{ width: '100%' }} />
          </Form.Item>
        );
      case FIELD_TYPES.TEXTAREA:
        return (
          <Form.Item {...formItemProps}>
            <TextArea placeholder={placeholder} rows={4} style={{ width: '100%' }} />
          </Form.Item>
        );
      case FIELD_TYPES.CHECKBOX:
        return (
          <Form.Item {...formItemProps}>
            <Checkbox.Group options={options} style={{ width: '100%' }} />
          </Form.Item>
        );
      case FIELD_TYPES.RADIO:
        return (
          <Form.Item {...formItemProps}>
            <Radio.Group style={{ width: '100%' }}>
              {options.map((option: string, index: number) => (
                <Radio key={index} value={option}>{option}</Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );
      case FIELD_TYPES.NUMBER:
        return (
          <Form.Item {...formItemProps}>
            <InputNumber 
              min={minValue} 
              max={maxValue} 
              placeholder={placeholder} 
              style={{ width: '100%' }} 
            />
          </Form.Item>
        );
      case FIELD_TYPES.SELECT:
        return (
          <Form.Item {...formItemProps}>
            <Select 
              placeholder={placeholder} 
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string).toLowerCase().indexOf(input.toLowerCase()) !== -1
              }
              style={{ width: '100%' }}
            >
              {options.map((option: string, index: number) => (
                <Option key={index} value={option}>{option}</Option>
              ))}
            </Select>
          </Form.Item>
        );
      default:
        return null;
    }
  };

  // Render the field configuration modal
  const renderFieldModal = () => (
    <Modal
      title={isEditing ? "Edit Field" : "Add Field"}
      open={isModalVisible}
      onOk={handleAddField}
      onCancel={() => {
        setIsModalVisible(false);
        setCurrentField(getInitialField());
        form.resetFields();
        setIsEditing(false);
      }}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={currentField}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Field Type"
              rules={[{ required: true, message: 'Please select a field type' }]}
            >
              <Select onChange={(value) => setCurrentField({ ...currentField, type: value })}>
                <Option value={FIELD_TYPES.INPUT}>Text Input</Option>
                <Option value={FIELD_TYPES.TEXTAREA}>Text Area</Option>
                <Option value={FIELD_TYPES.CHECKBOX}>Multiple Choice (Checkbox)</Option>
                <Option value={FIELD_TYPES.RADIO}>Radio Buttons</Option>
                <Option value={FIELD_TYPES.NUMBER}>Number</Option>
                <Option value={FIELD_TYPES.SELECT}>Dropdown Select</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="label"
              label="Field Label"
              rules={[{ required: true, message: 'Please enter a label' }]}
            >
              <Input placeholder="Enter field label" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="placeholder"
          label="Placeholder"
        >
          <Input placeholder="Enter placeholder text" />
        </Form.Item>

        <Form.Item
          name="instructions"
          label="Instructions"
        >
          <Input placeholder="Enter instructions for this field" />
        </Form.Item>

        <Form.Item
          name="required"
          valuePropName="checked"
        >
          <Switch checkedChildren="Required" unCheckedChildren="Optional" />
        </Form.Item>

        {(currentField.type === FIELD_TYPES.NUMBER) && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minValue"
                label="Minimum Value"
              >
                <InputNumber />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxValue"
                label="Maximum Value"
              >
                <InputNumber />
              </Form.Item>
            </Col>
          </Row>
        )}

        {(currentField.type === FIELD_TYPES.CHECKBOX || 
          currentField.type === FIELD_TYPES.RADIO || 
          currentField.type === FIELD_TYPES.SELECT) && (
          <div>
            <div className="options-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4>Options</h4>
              <Button type="dashed" onClick={handleAddOption} icon={<PlusOutlined />}>
                Add Option
              </Button>
            </div>
            {currentField.options.map((option: string, index: number) => (
              <div key={index} style={{ display: 'flex', marginBottom: '8px' }}>
                <Input
                  value={option}
                  onChange={(e) => handleOptionTextChange(index, e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveOption(index)}
                  disabled={currentField.options.length <= 1}
                />
              </div>
            ))}
          </div>
        )}
      </Form>
    </Modal>
  );

  // If in preview mode, render the form with the configured fields
  if (showPreview) {
    return (
      <Card 
        title="Form Preview" 
        extra={
          localPreview ? (
            <Button onClick={() => setLocalPreview(false)}>
              Back to Editor
            </Button>
          ) : null
        }
      >
        <Form
          form={previewForm}
          layout="vertical"
          onFinish={handlePreviewSubmit}
          style={{ width: '100%' }}
        >
          {fields.length > 0 ? (
            <>
              {fields.map((field) => (
                <div key={field.id} style={{ width: '100%' }}>
                  {renderPreviewField(field)}
                </div>
              ))}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '4px' }}>
              No fields have been added to this form yet.
            </div>
          )}
        </Form>
      </Card>
    );
  }

  // Otherwise, render the form builder
  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => {
            setIsModalVisible(true);
            setIsEditing(false);
            form.resetFields();
            setCurrentField(getInitialField());
          }}
        >
          Add Form Field
        </Button>
        
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => setLocalPreview(true)}
          disabled={fields.length === 0}
        >
          Preview Form
        </Button>
      </Space>

      {fields.length > 0 ? (
        <div>
          {fields.map((field, index) => (
            <Card 
              key={field.id} 
              style={{ marginBottom: 16 }}
              title={`${index + 1}. ${field.label} (${field.type})`}
              extra={
                <Space>
                  <Tooltip title="Move Up">
                    <Button 
                      icon={<ArrowUpOutlined />} 
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                    />
                  </Tooltip>
                  <Tooltip title="Move Down">
                    <Button 
                      icon={<ArrowDownOutlined />} 
                      disabled={index === fields.length - 1}
                      onClick={() => handleMoveDown(index)}
                    />
                  </Tooltip>
                  <Tooltip title="Edit">
                    <Button 
                      icon={<EditOutlined />} 
                      onClick={() => handleEditField(field)}
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleDeleteField(field.id)}
                    />
                  </Tooltip>
                </Space>
              }
            >
              <p><strong>Type:</strong> {field.type}</p>
              {field.placeholder && <p><strong>Placeholder:</strong> {field.placeholder}</p>}
              {field.instructions && <p><strong>Instructions:</strong> {field.instructions}</p>}
              <p><strong>Required:</strong> {field.required ? 'Yes' : 'No'}</p>
              
              {(field.type === FIELD_TYPES.CHECKBOX || 
                field.type === FIELD_TYPES.RADIO || 
                field.type === FIELD_TYPES.SELECT) && (
                <div>
                  <p><strong>Options:</strong></p>
                  <ul>
                    {field.options.map((option: string, i: number) => (
                      <li key={i}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {field.type === FIELD_TYPES.NUMBER && (
                <p><strong>Range:</strong> {field.minValue} to {field.maxValue}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '4px' }}>
          No fields added yet. Click "Add Form Field" to start building your form.
        </div>
      )}

      {renderFieldModal()}
    </div>
  );
};

export default AntdElementsForm;


