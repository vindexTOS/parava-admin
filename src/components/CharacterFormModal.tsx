import { useEffect, useState } from 'react';
import {
  Form,
  Modal,
  Input,
  Space,
  Upload,
  Image,
  message,
  Card,
  Button,
} from 'antd';
import type { UploadFile } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Character, CharacterPhrases } from '../api';
import {
  useCharacterCreate,
  useCharacterUpdate,
  useCharacterUploadGif,
  useCharacterRemoveGif,
} from '../hooks';
import { charactersApi } from '../api/characters.api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:1234';

const DEFAULT_PHRASES: CharacterPhrases = {
  negative: [],
  positive: [],
  neutral: [],
};

function PhraseList({
  value,
  onChange,
  label,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  const [items, setItems] = useState<string[]>(value?.length ? [...value] : ['']);

  useEffect(() => {
    setItems(value?.length ? [...value] : ['']);
  }, [value]);

  const update = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = val;
    setItems(next);
    onChange(next.filter(Boolean));
  };

  const add = () => {
    const next = [...items, ''];
    setItems(next);
  };

  const remove = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next.length ? next : ['']);
    onChange(next.filter(Boolean));
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <span style={{ fontWeight: 500 }}>{label}</span>
      {items.map((item, idx) => (
        <Space key={idx} style={{ width: '100%' }}>
          <Input
            value={item}
            onChange={(e) => update(idx, e.target.value)}
            placeholder={`Phrase ${idx + 1}`}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => remove(idx)}
          />
        </Space>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} onClick={add} block>
        Add phrase
      </Button>
    </Space>
  );
}

export function CharacterFormModal({
  open,
  character,
  onClose,
  onSuccess,
}: {
  open: boolean;
  character: Character | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm();
  const [phrases, setPhrases] = useState<CharacterPhrases>(DEFAULT_PHRASES);
  const [gifFile, setGifFile] = useState<File | null>(null);

  const createMutation = useCharacterCreate();
  const updateMutation = useCharacterUpdate();
  const uploadGifMutation = useCharacterUploadGif();
  const removeGifMutation = useCharacterRemoveGif();

  const isEdit = Boolean(character?.id);

  useEffect(() => {
    if (open) {
      setGifFile(null);
      setPhrases(
        character?.phrases ?? {
          negative: [],
          positive: [],
          neutral: [],
        }
      );
      form.setFieldsValue({
        name: character?.name ?? '',
        description: character?.description ?? '',
      });
    }
  }, [open, character, form]);

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      const payload = {
        name: values.name,
        description: values.description || null,
        phrases,
      };
      if (isEdit && character) {
        updateMutation.mutate(
          { id: character.id, body: payload },
          {
            onSuccess: async () => {
              if (gifFile) {
                try {
                  await charactersApi.uploadGif(character.id, gifFile);
                  message.success('GIF uploaded');
                } catch {
                  message.error('GIF upload failed');
                }
              }
              onSuccess();
            },
          }
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: async (data) => {
            if (gifFile) {
              try {
                await charactersApi.uploadGif(data.id, gifFile);
                message.success('GIF uploaded');
              } catch {
                message.error('GIF upload failed');
              }
            }
            onSuccess();
          },
        });
      }
    });
  };

  const handleRemoveGif = (gifId: string) => {
    if (!character) return;
    removeGifMutation.mutate(
      { characterId: character.id, gifId },
      { onSuccess: () => message.success('GIF removed') }
    );
  };

  return (
    <Modal
      title={isEdit ? 'Edit character' : 'Create character'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={
        createMutation.isPending ||
        updateMutation.isPending ||
        uploadGifMutation.isPending
      }
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="Duffy" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Friendly owl mascot" />
        </Form.Item>
        <Form.Item label="Phrases">
          <Card size="small" style={{ marginBottom: 12 }}>
            <PhraseList
              value={phrases.negative}
              onChange={(v) => setPhrases((p) => ({ ...p, negative: v }))}
              label="Negative"
            />
          </Card>
          <Card size="small" style={{ marginBottom: 12 }}>
            <PhraseList
              value={phrases.positive}
              onChange={(v) => setPhrases((p) => ({ ...p, positive: v }))}
              label="Positive"
            />
          </Card>
          <Card size="small">
            <PhraseList
              value={phrases.neutral}
              onChange={(v) => setPhrases((p) => ({ ...p, neutral: v }))}
              label="Neutral"
            />
          </Card>
        </Form.Item>
        <Form.Item label="GIFs">
          <Space direction="vertical" style={{ width: '100%' }}>
            {character?.gifs?.map((g) => (
              <Space key={g.id}>
                <Image
                  src={`${BASE_URL}${g.path}`}
                  alt=""
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
                <Button
                  type="text"
                  danger
                  size="small"
                  onClick={() => handleRemoveGif(g.id)}
                  loading={removeGifMutation.isPending}
                >
                  Remove
                </Button>
              </Space>
            ))}
            <Upload
              accept=".gif"
              maxCount={1}
              beforeUpload={(file) => {
                setGifFile(file);
                return false;
              }}
              onRemove={() => setGifFile(null)}
              fileList={
                gifFile
                  ? ([{ uid: '-1', name: gifFile.name }] as UploadFile[])
                  : []
              }
            >
              <Button type="dashed" icon={<PlusOutlined />}>
                Add GIF
              </Button>
            </Upload>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
