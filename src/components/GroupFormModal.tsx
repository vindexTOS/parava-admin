import { useEffect } from 'react';
import { Form, Modal, Input, Space } from 'antd';
import type { Group, CreateGroupBody, LocalizedText } from '../api';
import { useGroupCreate, useGroupUpdate } from '../hooks';

const LANG_KEYS = ['en', 'ru', 'ka'] as const;

function LocalizedFields({
  namePrefix,
  label,
  required = true,
}: {
  namePrefix: (string | number)[];
  label?: string;
  required?: boolean;
}) {
  return (
    <Space orientation="vertical" style={{ width: '100%' }}>
      {LANG_KEYS.map((lang) => (
        <Form.Item
          key={lang}
          name={[...namePrefix, lang]}
          label={label ? `${label} (${lang.toUpperCase()})` : lang.toUpperCase()}
          rules={required ? [{ required: true, message: 'Required' }] : undefined}
        >
          <Input />
        </Form.Item>
      ))}
    </Space>
  );
}

export function GroupFormModal({
  open,
  group,
  onClose,
  onSuccess,
}: {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm();
  const createMutation = useGroupCreate();
  const updateMutation = useGroupUpdate();

  const isEdit = Boolean(group?.id);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        group
          ? {
              name: group.name ?? { en: '', ru: '', ka: '' },
              color: group.color,
              backgroundColor: group.backgroundColor,
              description: group.description ?? { en: '', ru: '', ka: '' },
            }
          : {}
      );
    }
  }, [open, group, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload: CreateGroupBody = {
        name: values.name as LocalizedText,
        color: values.color,
        backgroundColor: values.backgroundColor,
        description:
          values.description && (values.description.en || values.description.ru || values.description.ka)
            ? values.description
            : null,
      };
      if (isEdit && group) {
        updateMutation.mutate(
          { id: group.id, body: payload },
          { onSuccess: () => onSuccess() }
        );
      } else {
        createMutation.mutate(payload, { onSuccess: () => onSuccess() });
      }
    });
  };

  return (
    <Modal
      title={isEdit ? 'Edit group' : 'Create group'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" preserve={false}>
        <LocalizedFields namePrefix={['name']} label="Name" />
        <Form.Item name="color" label="Color" rules={[{ required: true }]}>
          <Input placeholder="#hex or name" />
        </Form.Item>
        <Form.Item name="backgroundColor" label="Background color" rules={[{ required: true }]}>
          <Input placeholder="#hex or name" />
        </Form.Item>
        <LocalizedFields namePrefix={['description']} label="Description" required={false} />
      </Form>
    </Modal>
  );
}
