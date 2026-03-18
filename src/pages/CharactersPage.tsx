import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Popconfirm,
  Empty,
  Spin,
  Image,
  Collapse,
  Breadcrumb,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import {
  useCharacters,
  useCharacterDelete,
} from '../hooks';
import { CharacterFormModal } from '../components/CharacterFormModal';
import type { Character } from '../api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:1234';

export function CharactersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const { data: characters = [], isPending } = useCharacters();
  const deleteMutation = useCharacterDelete();

  const openCreate = () => {
    setEditingCharacter(null);
    setModalOpen(true);
  };
  const openEdit = (c: Character) => {
    setEditingCharacter(c);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingCharacter(null);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumb
        items={[
          { title: <Link to="/"><HomeOutlined /> Home</Link> },
          { title: 'Characters' },
        ]}
      />
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Characters
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add character
        </Button>
      </Space>

      {isPending ? (
        <Spin style={{ display: 'block', margin: '48px auto' }} />
      ) : characters.length === 0 ? (
        <Card>
          <Empty
            description="No characters yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={openCreate}>
              Create character
            </Button>
          </Empty>
        </Card>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {characters.map((c) => (
            <Card
              key={c.id}
              title={
                <Space>
                  <Typography.Text strong>{c.name}</Typography.Text>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEdit(c)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete this character?"
                    onConfirm={() => deleteMutation.mutate(c.id)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              }
            >
              {c.description && (
                <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
                  {c.description}
                </Typography.Paragraph>
              )}
              <Space wrap>
                {c.gifs?.map((g) => (
                  <Space key={g.id} direction="vertical" align="center">
                    <Image
                      src={`${BASE_URL}${g.path}`}
                      alt=""
                      height={80}
                      style={{ objectFit: 'contain', borderRadius: 8 }}
                    />
                  </Space>
                ))}
              </Space>
              <Collapse
                ghost
                size="small"
                style={{ marginTop: 12 }}
                items={[
                  {
                    key: 'phrases',
                    label: 'Phrases',
                    children: (
                      <Space direction="vertical">
                        {c.phrases.negative?.length > 0 && (
                          <div>
                            <Typography.Text type="secondary">Negative: </Typography.Text>
                            {c.phrases.negative.join(', ')}
                          </div>
                        )}
                        {c.phrases.positive?.length > 0 && (
                          <div>
                            <Typography.Text type="secondary">Positive: </Typography.Text>
                            {c.phrases.positive.join(', ')}
                          </div>
                        )}
                        {c.phrases.neutral?.length > 0 && (
                          <div>
                            <Typography.Text type="secondary">Neutral: </Typography.Text>
                            {c.phrases.neutral.join(', ')}
                          </div>
                        )}
                        {!c.phrases.negative?.length &&
                          !c.phrases.positive?.length &&
                          !c.phrases.neutral?.length && (
                            <Typography.Text type="secondary">No phrases</Typography.Text>
                          )}
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          ))}
        </Space>
      )}

      <CharacterFormModal
        open={modalOpen}
        character={editingCharacter}
        onClose={closeModal}
        onSuccess={closeModal}
      />
    </Space>
  );
}
