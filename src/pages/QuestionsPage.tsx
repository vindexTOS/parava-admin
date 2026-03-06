import { Link } from 'react-router-dom';
import { Table, Button, Space, Typography, Popconfirm, Image, Card, Breadcrumb, Tooltip, Select, Modal, Row, Col, Spin, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, FilterOutlined, BookOutlined } from '@ant-design/icons';
import type { Question, QuestionSubjectGrouped } from '../api';
import { formatLocalized } from '../api';
import { useQuestionsList, useQuestionDelete, useQuestionCategories, useQuestionSubjectsGrouped } from '../hooks';
import { useQuestionModalStore, useQuestionsListStore } from '../stores';
import { QuestionFormModal } from '../components/QuestionFormModal';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { questionsApi } from '../api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:1234';

function SubjectQuestionsModal({
  open,
  subject,
  onClose,
}: {
  open: boolean;
  subject: QuestionSubjectGrouped | null;
  onClose: () => void;
}) {
  const { data, isPending } = useQuery({
    queryKey: ['questionsBySubject', subject?.code, open],
    queryFn: () =>
      questionsApi
        .getAll({ page: 1, limit: 500, subject: subject?.code })
        .then((r) => r.data),
    enabled: open && subject != null,
  });
  const questions = data?.data ?? [];

  return (
    <Modal
      title={subject ? `${formatLocalized(subject.name)} (${subject.questionCount} questions)` : 'Questions'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnHidden
    >
      {isPending ? (
        <Spin style={{ display: 'block', margin: '24px auto' }} />
      ) : questions.length === 0 ? (
        <Empty description="No questions in this subject" style={{ margin: 24 }} />
      ) : (
        <Table
          size="small"
          rowKey="id"
          dataSource={questions}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `Total ${t}` }}
          columns={[
            { title: 'ID', dataIndex: 'externalId', width: 70 },
            {
              title: 'Text (KA)',
              key: 'text',
              ellipsis: true,
              render: (_: unknown, r: Question) => (
                <Tooltip title={r.questionText?.ka ?? '—'}>
                  <span>{(r.questionText?.ka ?? '—').slice(0, 50)}…</span>
                </Tooltip>
              ),
            },
          ]}
        />
      )}
    </Modal>
  );
}

export function QuestionsPage() {
  const { page, limit, category, subject, setPage, setCategory, setSubject } = useQuestionsListStore();
  const { openCreate, openEdit, close, open, editingId } = useQuestionModalStore();
  const [subjectModal, setSubjectModal] = useState<QuestionSubjectGrouped | null>(null);
  const { data, isPending } = useQuestionsList();
  const { data: categoryLabels } = useQuestionCategories();
  const { data: subjectsGrouped = [] } = useQuestionSubjectsGrouped();
  const deleteMutation = useQuestionDelete();

  const categoryOptions = categoryLabels
    ? Object.entries(categoryLabels).map(([code, label]) => ({ value: Number(code), label }))
    : [];
  const subjectOptions = subjectsGrouped.map((s) => ({
    value: s.code,
    label: `${formatLocalized(s.name)} (${s.questionCount})`,
  }));

  const onModalSuccess = () => useQuestionModalStore.getState().close();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'externalId',
      width: 80,
      render: (v: number) => <Typography.Text copyable>{v}</Typography.Text>,
    },
    {
      title: 'Text (KA)',
      key: 'text',
      ellipsis: true,
      render: (_: unknown, r: Question) => {
        const full = r.questionText?.ka ?? '—';
        const truncated = full.length > 30 ? `${full.slice(0, 30)}…` : full;
        return <Tooltip title={full}><span>{truncated}</span></Tooltip>;
      },
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      width: 90,
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      width: 140,
      render: (cats: number[]) => {
        if (!cats?.length) return '—';
        const labels = categoryLabels
          ? cats.map((c) => (categoryLabels as Record<number, string>)[c] ?? String(c)).join(', ')
          : cats.join(', ');
        return labels;
      },
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      width: 70,
      render: (url: string | null) =>
        url ? (
          <Image
            src={url.startsWith('http') ? url : `${BASE_URL}${url}`}
            width={40}
            height={40}
            alt=""
          />
        ) : (
          '—'
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, r: Question) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r.id)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this question?"
            onConfirm={() => deleteMutation.mutate(r.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumb
        items={[
          { title: <Link to="/"><HomeOutlined /> Home</Link> },
          { title: 'Questions' },
        ]}
      />
      {subjectsGrouped.length > 0 && (
        <Card title="Subjects" size="small">
          <Row gutter={[12, 12]}>
            {subjectsGrouped.map((s) => (
              <Col key={s.id}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => setSubjectModal(s)}
                  style={{ width: 180, cursor: 'pointer' }}
                  styles={{ body: { padding: '12px 16px' } }}
                >
                  <Space>
                    <BookOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                    <div>
                      <Typography.Text strong>{formatLocalized(s.name)}</Typography.Text>
                      <br />
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {s.questionCount} questions
                      </Typography.Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
      <Card
        title="Questions list"
        extra={
          <Space wrap>
            <Select
              placeholder="Filter by subject"
              allowClear
              suffixIcon={<FilterOutlined />}
              options={subjectOptions}
              value={subject ?? undefined}
              onChange={(v) => setSubject(v ?? null)}
              style={{ minWidth: 180 }}
            />
            <Select
              mode="multiple"
              placeholder="Filter by category"
              allowClear
              suffixIcon={<FilterOutlined />}
              options={categoryOptions}
              value={category.length ? category : undefined}
              onChange={(v) => setCategory(v ?? [])}
              style={{ minWidth: 200 }}
              maxTagCount="responsive"
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Add question
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data?.data ?? []}
          loading={isPending}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.total ?? 0,
            showSizeChanger: false,
            onChange: setPage,
            showTotal: (total) => `Total ${total} items`,
          }}
        />
      </Card>
      <QuestionFormModal open={open} questionId={editingId} onClose={close} onSuccess={onModalSuccess} />
      <SubjectQuestionsModal
        open={subjectModal != null}
        subject={subjectModal}
        onClose={() => setSubjectModal(null)}
      />
    </Space>
  );
}
