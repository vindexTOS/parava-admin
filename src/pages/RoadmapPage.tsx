import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Space, Typography, Collapse, Popconfirm, Empty, Spin, Tag, Breadcrumb, Image } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useGroups, useRounds, useGroupDelete, useRoundDelete } from '../hooks';
import { GroupFormModal } from '../components/GroupFormModal';
import { RoundFormModal } from '../components/RoundFormModal';
import { RoundQuestionsDrawer } from '../components/RoundQuestionsDrawer';
import type { Group, Round } from '../api';
import { formatLocalized } from '../api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:1234';

function GroupRoundsSection({
  group,
  onAddRound,
  onEditRound,
  onManageQuestions,
  onDeleteRound,
}: {
  group: Group;
  onAddRound: (groupId: string) => void;
  onEditRound: (groupId: string, round: Round) => void;
  onManageQuestions: (roundId: string, roundTitle: string) => void;
  onDeleteRound: (roundId: string) => void;
}) {
  const { data: rounds = [] } = useRounds(group.id);

  return (
    <div style={{ paddingLeft: 24 }}>
      <Space orientation="vertical" style={{ width: '100%' }}>
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onAddRound(group.id)}
        >
          Add round
        </Button>
        {rounds.length === 0 ? (
          <Typography.Text type="secondary">No rounds yet</Typography.Text>
        ) : (
          <Space wrap>
            {rounds.map((r) => (
              <Card
                key={r.id}
                size="small"
                style={{
                  minWidth: 200,
                  borderColor: r.color ?? undefined,
                  borderLeftWidth: r.color ? 3 : undefined,
                }}
                actions={[
                  <Button
                    key="q"
                    type="text"
                    size="small"
                    icon={<UnorderedListOutlined />}
                    onClick={() => onManageQuestions(r.id, formatLocalized(r.title))}
                  />,
                  <Button
                    key="e"
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEditRound(group.id, r)}
                  />,
                  <Popconfirm
                    key="d"
                    title="Delete this round?"
                    onConfirm={() => onDeleteRound(r.id)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={
                    <Space>
                      {r.icon && (
                        <Tag color={r.color ?? 'default'}>{r.icon}</Tag>
                      )}
                      {formatLocalized(r.title)}
                    </Space>
                  }
                  description={
                    <>
                      <Tag>XP: {r.xp}</Tag>
                      {r.description && (
                        <Typography.Text
                          ellipsis
                          type="secondary"
                          style={{ fontSize: 12 }}
                        >
                          {formatLocalized(r.description)}
                        </Typography.Text>
                      )}
                    </>
                  }
                />
              </Card>
            ))}
          </Space>
        )}
      </Space>
    </div>
  );
}

export function RoadmapPage() {
  const [groupModal, setGroupModal] = useState<{ open: boolean; group: Group | null }>({
    open: false,
    group: null,
  });
  const [roundModal, setRoundModal] = useState<{
    open: boolean;
    groupId: string;
    round: Round | null;
  }>({ open: false, groupId: '', round: null });
  const [questionsDrawer, setQuestionsDrawer] = useState<{
    open: boolean;
    roundId: string | null;
    roundTitle: string;
  }>({ open: false, roundId: null, roundTitle: '' });

  const { data: groups = [], isPending: loadingGroups } = useGroups();
  const groupDeleteMutation = useGroupDelete();
  const roundDeleteMutation = useRoundDelete();

  const openCreateGroup = () => setGroupModal({ open: true, group: null });
  const openEditGroup = (g: Group) => setGroupModal({ open: true, group: g });
  const closeGroupModal = () => setGroupModal({ open: false, group: null });

  const openCreateRound = (groupId: string) =>
    setRoundModal({ open: true, groupId, round: null });
  const openEditRound = (groupId: string, r: Round) =>
    setRoundModal({ open: true, groupId, round: r });
  const closeRoundModal = () =>
    setRoundModal((prev) => ({ ...prev, open: false }));

  const openQuestionsDrawer = (roundId: string, roundTitle: string) =>
    setQuestionsDrawer({ open: true, roundId, roundTitle });
  const closeQuestionsDrawer = () =>
    setQuestionsDrawer({ open: false, roundId: null, roundTitle: '' });

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumb
        items={[
          { title: <Link to="/"><HomeOutlined /> Home</Link> },
          { title: 'Roadmap' },
        ]}
      />

      <Card
        title="Groups & Rounds"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateGroup}>
            Add group
          </Button>
        }
      >
        {loadingGroups ? (
          <Spin style={{ display: 'block', margin: '48px auto' }} />
        ) : groups.length === 0 ? (
          <Empty description="No groups. Create one to start." />
        ) : (
          <Collapse
            ghost
            items={groups.map((g) => ({
            key: g.id,
            label: (
              <Space>
                {g.mascotUrl && (
                  <Image
                    src={`${BASE_URL}${g.mascotUrl}`}
                    alt="Mascot"
                    width={40}
                    height={40}
                    style={{ objectFit: 'contain', borderRadius: 8 }}
                    preview={false}
                  />
                )}
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 4,
                    background: g.backgroundColor,
                    border: `1px solid ${g.color}`,
                  }}
                />
                <Typography.Text strong>{formatLocalized(g.name)}</Typography.Text>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditGroup(g);
                    }}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete this group and all its rounds?"
                    onConfirm={() => groupDeleteMutation.mutate(g.id)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              ),
              children: (
                <GroupRoundsSection
                  group={g}
                  onAddRound={openCreateRound}
                  onEditRound={openEditRound}
                  onManageQuestions={openQuestionsDrawer}
                  onDeleteRound={(id) => roundDeleteMutation.mutate(id)}
                />
              ),
            }))}
          />
        )}
      </Card>

      <GroupFormModal
        open={groupModal.open}
        group={groupModal.group}
        onClose={closeGroupModal}
        onSuccess={closeGroupModal}
      />

      <RoundFormModal
        open={roundModal.open}
        groupId={roundModal.groupId}
        round={roundModal.round}
        onClose={closeRoundModal}
        onSuccess={closeRoundModal}
      />

      <RoundQuestionsDrawer
        open={questionsDrawer.open}
        roundId={questionsDrawer.roundId}
        roundTitle={questionsDrawer.roundTitle}
        onClose={closeQuestionsDrawer}
      />
    </Space>
  );
}
