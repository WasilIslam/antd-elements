import React, { useState } from 'react';
import { Form, Input, Button, Space, Modal, Select, Checkbox, Radio, InputNumber, Switch, Card, Row, Col, Tooltip, Steps, DatePicker, Table, Tag } from 'antd';
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
  DATE: 'date',
  FORM_BREAK: 'formBreak', // New type for form breaks
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
  heading: '', // For form breaks
  description: '', // For form breaks
});

interface FormGeneratorProps {
  /**
   * Initial form fields configuration
   */
  initialFields?: any[];
  
  /**
   * Callback when fields are changed in editor mode
   */
  onFieldsChange?: (fields: any[]) => void;
  
  /**
   * Whether to display in preview mode instead of editor mode
   */
  displayMode?: 'editor' | 'preview';
  
  /**
   * Callback when form is submitted in preview mode
   */
  onFormSubmit?: (values: any) => void;
}

const AntdElementsForm: React.FC<FormGeneratorProps> = ({
  initialFields = [],
  onFieldsChange,
  displayMode = 'editor',
  onFormSubmit,
}) => {
  const [fields, setFields] = useState<any[]>(initialFields);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState(getInitialField());
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [previewForm] = Form.useForm();
  const [localPreview, setLocalPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [firstPageConfig, setFirstPageConfig] = useState({ heading: 'Form', description: '' });
  const [isFirstPageModalVisible, setIsFirstPageModalVisible] = useState(false);
  const [firstPageForm] = Form.useForm();

  // Display either the passed displayMode prop or local preview state
  const showPreview = displayMode === 'preview' || localPreview;

  // Update fields and trigger onFieldsChange
  const updateFields = (newFields: any[]) => {
    setFields(newFields);
    if (onFieldsChange) {
      onFieldsChange(newFields);
    }
  };

  // Add a new field
  const handleAddField = () => {
    form.validateFields()
      .then((values) => {
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
      })
      .catch((errorInfo) => {
        // Just log the error but don't crash the app
        console.log('Validation failed:', errorInfo);
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
    if (onFormSubmit) {
      onFormSubmit(values);
    }
  };

  // Handle first page configuration
  const handleFirstPageConfig = () => {
    firstPageForm.validateFields().then(values => {
      setFirstPageConfig(values);
      setIsFirstPageModalVisible(false);
    }).catch(err => console.log('Validation failed:', err));
  };

  // Get form pages based on form breaks
  const getFormPages = () => {
    const pages: Array<{fields: any[], heading: string, description: string}> = [];
    let currentPage: any[] = [];
    
    // Process all fields
    fields.forEach(field => {
      if (field.type === FIELD_TYPES.FORM_BREAK) {
        pages.push({
          fields: currentPage,
          heading: field.heading,
          description: field.description
        });
        currentPage = [];
      } else {
        currentPage.push(field);
      }
    });
    
    // Add the last page
    pages.push({
      fields: currentPage,
      heading: pages.length === 0 ? firstPageConfig.heading : '', 
      description: pages.length === 0 ? firstPageConfig.description : ''
    });
    
    return pages;
  };

  // Get steps for the Steps component
  const getSteps = () => {
    const pages = getFormPages();
    return pages.map((page, index) => ({
      title: page.heading || `Page ${index + 1}`,
      description: page.description || '',
    }));
  };

  // Render field in preview mode
  const renderPreviewField = (field: any) => {
    // Skip rendering form breaks in preview mode
    if (field.type === FIELD_TYPES.FORM_BREAK) {
      return null;
    }
    
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
      case FIELD_TYPES.DATE:
        return (
          <Form.Item {...formItemProps}>
            <DatePicker 
              placeholder={placeholder} 
              style={{ width: '100%' }} 
            />
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
              <Select 
                onChange={(value) => setCurrentField({ ...currentField, type: value })}
                optionLabelProp="label"
              >
                <Option value={FIELD_TYPES.INPUT} label="Text Input">
                  <Space>
                    <span role="img" aria-label="text">📝</span>
                    Text Input
                  </Space>
                </Option>
                <Option value={FIELD_TYPES.TEXTAREA} label="Text Area">
                  <Space>
                    <span role="img" aria-label="textarea">📄</span>
                    Text Area
                  </Space>
                </Option>
                <Option value={FIELD_TYPES.CHECKBOX} label="Multiple Choice (Checkbox)">
                  <Space>
                    <span role="img" aria-label="checkbox">☑️</span>
                    Multiple Choice (Checkbox)
                  </Space>
                </Option>
                <Option value={FIELD_TYPES.RADIO} label="Radio Buttons">
                  <Space>
                    <span role="img" aria-label="radio">⚪</span>
                    Radio Buttons
                  </Space>
                </Option>
                <Option value={FIELD_TYPES.NUMBER} label="Number">
                  <Space>
                    <span role="img" aria-label="number">🔢</span>
                    Number
                  </Space>
                </Option>
                <Option value={FIELD_TYPES.SELECT} label="Dropdown Select">
                  <Space>
                    <span role="img" aria-label="select">▼</span>
                    Dropdown Select
                  </Space>
                </Option>
                <Option value={FIELD_TYPES.DATE} label="Date Picker">
                  <Space>
                    <span role="img" aria-label="date">📅</span>
                    Date Picker
                  </Space>
                </Option>
                <Option value={FIELD_TYPES.FORM_BREAK} label="Form Page Break">
                  <Space>
                    <span role="img" aria-label="form-break">📑</span>
                    Form Page Break
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {currentField.type !== FIELD_TYPES.FORM_BREAK ? (
              <Form.Item
                name="label"
                label="Field Label"
                rules={[{ required: true, message: 'Please enter a label' }]}
              >
                <Input placeholder="Enter field label" />
              </Form.Item>
            ) : (
              <Form.Item
                name="heading"
                label="Page Heading"
                rules={[{ required: true, message: 'Please enter a page heading' }]}
              >
                <Input placeholder="Enter page heading" />
              </Form.Item>
            )}
          </Col>
        </Row>

        {currentField.type !== FIELD_TYPES.FORM_BREAK ? (
          // Regular field options
          <>
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
          </>
        ) : (
          // Form break options
          <Form.Item
            name="description"
            label="Page Description"
          >
            <TextArea 
              placeholder="Enter description for this page" 
              rows={4}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );

  // Render first page configuration modal
  const renderFirstPageModal = () => (
    <Modal
      title="Configure First Page"
      open={isFirstPageModalVisible}
      onOk={handleFirstPageConfig}
      onCancel={() => setIsFirstPageModalVisible(false)}
    >
      <Form
        form={firstPageForm}
        layout="vertical"
        initialValues={firstPageConfig}
      >
        <Form.Item
          name="heading"
          label="Page Heading"
          rules={[{ required: true, message: 'Please enter a page heading' }]}
        >
          <Input placeholder="Enter page heading" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Page Description"
        >
          <TextArea 
            placeholder="Enter description for this page" 
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  // Table columns for the form fields
  const columns = [
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      render: (_: any, _record: any, index: number) => index + 1
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => {
        let color = 'blue';
        let icon = '📝';
        
        switch(type) {
          case FIELD_TYPES.TEXTAREA: 
            color = 'cyan'; 
            icon = '📄';
            break;
          case FIELD_TYPES.CHECKBOX: 
            color = 'green'; 
            icon = '☑️';
            break;
          case FIELD_TYPES.RADIO: 
            color = 'volcano'; 
            icon = '⚪';
            break;
          case FIELD_TYPES.NUMBER: 
            color = 'purple'; 
            icon = '🔢';
            break;
          case FIELD_TYPES.SELECT: 
            color = 'magenta'; 
            icon = '▼';
            break;
          case FIELD_TYPES.DATE: 
            color = 'gold'; 
            icon = '📅';
            break;
          case FIELD_TYPES.FORM_BREAK: 
            color = 'orange'; 
            icon = '📑';
            break;
        }
        
        return <Tag color={color}>{icon} {type}</Tag>;
      }
    },
    {
      title: 'Label/Heading',
      dataIndex: 'label',
      key: 'label',
      render: (text: string, record: any) => 
        record.type === FIELD_TYPES.FORM_BREAK ? record.heading : text
    },
    {
      title: 'Required',
      dataIndex: 'required',
      key: 'required',
      width: 100,
      render: (required: boolean, record: any) => 
        record.type === FIELD_TYPES.FORM_BREAK ? 
          '-' : 
          <Tag color={required ? 'red' : 'default'}>{required ? 'Yes' : 'No'}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (text: string, record: any, index: number) => (
        <Space>
          <Tooltip title="Move Up">
            <Button 
              icon={<ArrowUpOutlined />} 
              disabled={index === 0}
              onClick={() => handleMoveUp(index)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Move Down">
            <Button 
              icon={<ArrowDownOutlined />} 
              disabled={index === fields.length - 1}
              onClick={() => handleMoveDown(index)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleEditField(record)}
              size="small"
              type="primary"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteField(record.id)}
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // If in preview mode, render the multi-page form with the configured fields
  if (showPreview) {
    const pages = getFormPages();
    const steps = getSteps();
    
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
        {pages.length > 1 && (
          <Steps 
            current={currentStep} 
            style={{ marginBottom: 24 }}
          >
            {steps.map((step, index) => (
              <Steps.Step 
                key={index} 
                title={step.title} 
                description={step.description} 
              />
            ))}
          </Steps>
        )}
        
        <Form
          form={previewForm}
          layout="vertical"
          onFinish={handlePreviewSubmit}
          style={{ width: '100%' }}
        >
          {fields.length > 0 ? (
            <>
              {pages[currentStep].heading && (
                <div style={{ marginBottom: 24 }}>
                  <h2>{pages[currentStep].heading}</h2>
                  {pages[currentStep].description && (
                    <p>{pages[currentStep].description}</p>
                  )}
                </div>
              )}
              
              {pages[currentStep].fields.map((field) => (
                <div key={field.id} style={{ width: '100%' }}>
                  {renderPreviewField(field)}
                </div>
              ))}
              
              <Form.Item>
                <Space>
                  {currentStep > 0 && (
                    <Button 
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < pages.length - 1 ? (
                    <Button 
                      type="primary" 
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="primary" htmlType="submit">
                      Submit
                    </Button>
                  )}
                </Space>
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
      <Card title="Form Builder" style={{ marginBottom: 16 }}>
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
            icon={<EditOutlined />} 
            onClick={() => {
              setIsFirstPageModalVisible(true);
              firstPageForm.setFieldsValue(firstPageConfig);
            }}
          >
            Configure First Page
          </Button>
          
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => {
              setLocalPreview(true);
              setCurrentStep(0); // Reset to first step when previewing
            }}
            disabled={fields.length === 0}
          >
            Preview Form
          </Button>
        </Space>

        {fields.length > 0 ? (
          <Table 
            dataSource={fields} 
            columns={columns} 
            rowKey="id"
            pagination={false}
            bordered
            size="middle"
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: '0 20px' }}>
                  {record.type === FIELD_TYPES.FORM_BREAK ? (
                    <>
                      <p><strong>Description:</strong> {record.description || 'None'}</p>
                    </>
                  ) : (
                    <>
                      {record.placeholder && <p><strong>Placeholder:</strong> {record.placeholder}</p>}
                      {record.instructions && <p><strong>Instructions:</strong> {record.instructions}</p>}
                      
                      {(record.type === FIELD_TYPES.CHECKBOX || 
                        record.type === FIELD_TYPES.RADIO || 
                        record.type === FIELD_TYPES.SELECT) && (
                        <div>
                          <p><strong>Options:</strong></p>
                          <ul>
                            {record.options.map((option: string, i: number) => (
                              <li key={i}>{option}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {record.type === FIELD_TYPES.NUMBER && (
                        <p><strong>Range:</strong> {record.minValue} to {record.maxValue}</p>
                      )}
                    </>
                  )}
                </div>
              ),
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '4px' }}>
            No fields added yet. Click "Add Form Field" to start building your form.
          </div>
        )}
      </Card>

      {renderFieldModal()}
      {renderFirstPageModal()}
    </div>
  );
};

export default AntdElementsForm;


