'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Space } from 'antd';
import { UserOutlined, MailOutlined, ProjectOutlined, PlusOutlined } from '@ant-design/icons';
import { User, UserRole } from '../types/plan';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: Partial<User>, templateType?: string) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = (values: any) => {
    setIsSubmitting(true);
    const { name, email, role, planType, customPlanName } = values;
    const projectTitle = customPlanName?.trim() || `${name}'s Custom Design`;

    onAddUser(
      {
        name,
        email: email?.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        role: role as UserRole,
        assignedPlan: projectTitle,
        isOnline: true,
      },
      planType || 'blank'
    );

    form.resetFields();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      title={
        <Space>
          <UserOutlined style={{ color: '#4f46e5' }} />
          <span>Add Customer Account</span>
        </Space>
      }
      footer={null}
      destroyOnClose
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          role: 'CUSTOMER',
          planType: 'blank',
        }}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="name"
          label="Full Name / Customer Name"
          rules={[{ required: true, message: 'Please enter name' }]}
        >
          <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="e.g. Alex Morgan" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[{ type: 'email', message: 'Please enter a valid email' }]}
        >
          <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="e.g. alex.morgan@example.com" />
        </Form.Item>

        <Form.Item name="role" label="Account Role" rules={[{ required: true }]}>
          <Select
            options={[
              { label: 'Customer (Pay & Use Application)', value: 'CUSTOMER' },
            ]}
          />
        </Form.Item>

        <Form.Item name="planType" label="Initial Design Template">
          <Select
            options={[
              { label: '✨ Fresh Blank Canvas', value: 'blank' },
              { label: 'Modern 2-Bedroom Suite', value: 'plan-sarah-suite' },
              { label: 'Luxury Multi-Story Villa', value: 'plan-david-villa' },
              { label: 'Urban Studio Loft', value: 'plan-emma-studio' },
            ]}
          />
        </Form.Item>

        <Form.Item name="customPlanName" label="Project Name (Optional)">
          <Input prefix={<ProjectOutlined style={{ color: '#bfbfbf' }} />} placeholder="e.g. Alex Morgan Penthouse Suite" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting} icon={<PlusOutlined />}>
              Onboard Customer
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

