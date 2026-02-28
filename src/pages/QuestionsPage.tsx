import { Link } from 'react-router-dom';
import { Table, Button, Space, Typography, Popconfirm, Image, Card, Breadcrumb, Tooltip, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, FilterOutlined } from '@ant-design/icons';
import type { Question } from '../api';
import { useQuestionsList, useQuestionDelete, useQuestionCategories } from '../hooks';
import { useQuestionModalStore, useQuestionsListStore } from '../stores';
import { QuestionFormModal } from '../components/QuestionFormModal';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:1234';

export function QuestionsPage() {
  const { page, limit, category, setPage, setCategory } = useQuestionsListStore();
  const { openCreate, openEdit, close, open, editingId } = useQuestionModalStore();
  const { data, isPending } = useQuestionsList();
  const { data: categoryLabels } = useQuestionCategories();
  const deleteMutation = useQuestionDelete();

  const categoryOptions = categoryLabels
    ? Object.entries(categoryLabels).map(([code, label]) => ({ value: Number(code), label }))
    : [];

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
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumb
        items={[
          { title: <Link to="/"><HomeOutlined /> Home</Link> },
          { title: 'Questions' },
        ]}
      />
      <Card
        title="Questions"
        extra={
          <Space>
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
    </Space>
  );
}
