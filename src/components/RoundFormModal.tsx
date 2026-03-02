import { useEffect } from 'react';
import { Form, Modal, Input, InputNumber, Space } from 'antd';
import type { Round, LocalizedText } from '../api';
import { useRoundCreate, useRoundUpdate } from '../hooks';

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

export function RoundFormModal({
  open,
  groupId,
  round,
  onClose,
  onSuccess,
}: {
  open: boolean;
  groupId: string;
  round: Round | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm();
  const createMutation = useRoundCreate();
  const updateMutation = useRoundUpdate();

  const isEdit = Boolean(round?.id);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        round
          ? {
              title: round.title ?? { en: '', ru: '', ka: '' },
              description: round.description ?? { en: '', ru: '', ka: '' },
              xp: round.xp,
            }
          : { groupId, xp: 5 }
      );
      if (!isEdit) form.setFieldValue('groupId', groupId);
    }
  }, [open, groupId, round, isEdit, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const desc =
        values.description && (values.description.en || values.description.ru || values.description.ka)
          ? (values.description as LocalizedText)
          : null;
      if (isEdit && round) {
        updateMutation.mutate(
          {
            id: round.id,
            body: {
              title: values.title as LocalizedText,
              description: desc,
              xp: values.xp,
            },
          },
          { onSuccess: () => onSuccess() }
        );
      } else {
        createMutation.mutate(
          {
            groupId,
            title: values.title as LocalizedText,
            description: desc,
            xp: values.xp ?? 5,
          },
          { onSuccess: () => onSuccess() }
        );
      }
    });
  };

  return (
    <Modal
      title={isEdit ? 'Edit round' : 'Create round'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" preserve={false}>
        {!isEdit && (
          <Form.Item name="groupId" hidden>
            <Input type="hidden" />
          </Form.Item>
        )}
        <LocalizedFields namePrefix={['title']} label="Title" />
        <LocalizedFields namePrefix={['description']} label="Description" required={false} />
        <Form.Item name="xp" label="XP" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
