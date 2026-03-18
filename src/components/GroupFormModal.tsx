import { useEffect, useState } from 'react';
import {
  Form,
  Modal,
  Input,
  Space,
  Upload,
  Image,
  message,
  Button,
} from 'antd';
import type { UploadFile } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { PlusOutlined } from '@ant-design/icons';
import type { Group, CreateGroupBody, LocalizedText } from '../api';
import { useGroupCreate, useGroupUpdate } from '../hooks';
import { groupsApi } from '../api/roadmap.api';

const LANG_KEYS = ['en', 'ru', 'ka'] as const;
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:1234';

function normalizeLocalizedText(input: unknown): LocalizedText {
  if (!input) return { en: '', ru: '', ka: '' };
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input) as Partial<LocalizedText>;
      return {
        en: parsed?.en ?? '',
        ru: parsed?.ru ?? '',
        ka: parsed?.ka ?? '',
      };
    } catch {
      return { en: '', ru: '', ka: '' };
    }
  }
  const obj = input as Partial<LocalizedText>;
  return {
    en: obj?.en ?? '',
    ru: obj?.ru ?? '',
    ka: obj?.ka ?? '',
  };
}

function getInitialValues(group: Group | null) {
  if (!group) {
    return {
      name: { en: '', ru: '', ka: '' },
      color: '',
      backgroundColor: '',
      description: { en: '', ru: '', ka: '' },
    };
  }
  return {
    name: normalizeLocalizedText(group.name),
    color: group.color ?? '',
    backgroundColor: group.backgroundColor ?? '',
    description: normalizeLocalizedText(group.description),
  };
}

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
  const [mascotFile, setMascotFile] = useState<File | null>(null);
  const [mascotUploading, setMascotUploading] = useState(false);
  const [selectedMascotPreview, setSelectedMascotPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createMutation = useGroupCreate();
  const updateMutation = useGroupUpdate();

  const isEdit = Boolean(group?.id);

  useEffect(() => {
    if (open) {
      setMascotFile(null);
      setSelectedMascotPreview(null);
      // AntD sometimes hasn't mounted nested fields yet on the same tick.
      // Populate after the modal renders.
      const values = getInitialValues(group);
      setTimeout(() => {
        form.setFieldsValue(values);
      }, 0);
    }
  }, [open, group, form]);

  useEffect(() => {
    if (!mascotFile) {
      setSelectedMascotPreview(null);
      return;
    }
    const url = URL.createObjectURL(mascotFile);
    setSelectedMascotPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [mascotFile]);

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
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
          {
            onSuccess: async () => {
              if (mascotFile) {
                setMascotUploading(true);
                try {
                  await groupsApi.uploadMascot(group.id, mascotFile);
                  await queryClient.invalidateQueries({ queryKey: ['groups'] });
                  message.success('Mascot uploaded');
                } catch (e) {
                  console.error(e);
                  message.error('Mascot upload failed');
                } finally {
                  setMascotUploading(false);
                }
              }
              onSuccess();
            },
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: async (data) => {
            if (mascotFile) {
              setMascotUploading(true);
              try {
                await groupsApi.uploadMascot(data.id, mascotFile);
                await queryClient.invalidateQueries({ queryKey: ['groups'] });
                message.success('Mascot uploaded');
              } catch (e) {
                console.error(e);
                message.error('Mascot upload failed');
              } finally {
                setMascotUploading(false);
              }
            }
            onSuccess();
          },
        });
      }
    });
  };

  const mascotPreview = group?.mascotUrl
    ? `${BASE_URL}${group.mascotUrl}`
    : null;

  return (
    <Modal
      title={isEdit ? 'Edit group' : 'Create group'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending || mascotUploading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        key={group?.id ?? 'new'}
      >
        <LocalizedFields namePrefix={['name']} label="Name" />
        <Form.Item name="color" label="Color" rules={[{ required: true }]}>
          <Input placeholder="#58cc02" />
        </Form.Item>
        <Form.Item name="backgroundColor" label="Background color" rules={[{ required: true }]}>
          <Input placeholder="#e6f4fe" />
        </Form.Item>
        <LocalizedFields namePrefix={['description']} label="Description" required={false} />
        <Form.Item label="Mascot GIF">
          <Space direction="vertical" style={{ width: '100%' }}>
            {(selectedMascotPreview || mascotPreview) && (
              <Image
                src={selectedMascotPreview ?? mascotPreview ?? undefined}
                alt="Mascot"
                height={80}
                style={{ objectFit: 'contain' }}
              />
            )}
            <Upload
              accept=".gif,image/gif"
              maxCount={1}
              beforeUpload={(file) => {
                setMascotFile(file);
                return false;
              }}
              onRemove={() => setMascotFile(null)}
              fileList={mascotFile ? [{ uid: '-1', name: mascotFile.name }] as UploadFile[] : []}
            >
              <Button type="dashed" icon={<PlusOutlined />}>
                Add Mascot GIF
              </Button>
            </Upload>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
