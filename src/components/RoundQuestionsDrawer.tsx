import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Drawer, Button, Spin, Typography, Empty, Input, Image, Flex, Pagination } from 'antd';
import { DeleteOutlined, HolderOutlined, SearchOutlined } from '@ant-design/icons';
import type { Question, RoundQuestion } from '../api';
import { useRoundQuestions, useRoundAddQuestion, useRoundRemoveQuestion, useRoundReorderQuestions, useQuestionsPool } from '../hooks';

const DROPPABLE_ROUND = 'round-questions';
const POOL_PAGE_SIZE = 20;
const DROPPABLE_POOL = 'pool';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:1234';

function parseIdFilter(input: string): Set<number> {
  const ids = input
    .split(/[\s,]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
  return new Set(ids);
}

function PoolItem({
  question,
  roundQuestionIds,
  onAdd,
}: {
  question: Question;
  roundQuestionIds: Set<string>;
  onAdd: () => void;
}) {
  const inRound = roundQuestionIds.has(question.id);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pool-${question.id}`,
    data: { type: 'pool', question },
    disabled: inRound,
  });

  const imgSrc = question.imageUrl
    ? (question.imageUrl.startsWith('http') ? question.imageUrl : `${BASE_URL}${question.imageUrl}`)
    : null;

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: '8px 12px',
        marginBottom: 4,
        background: isDragging ? 'rgba(24, 144, 255, 0.2)' : inRound ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)',
        borderRadius: 6,
        cursor: inRound ? 'not-allowed' : 'pointer',
        opacity: inRound ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
      onClick={inRound ? undefined : onAdd}
    >
      <HolderOutlined
        style={{ cursor: inRound ? 'not-allowed' : 'grab', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}
        {...listeners}
        {...attributes}
      />
      {imgSrc ? (
        <Image
          src={imgSrc}
          width={40}
          height={40}
          alt=""
          style={{ objectFit: 'cover', borderRadius: 4 }}
          draggable={false}
        />
      ) : (
        <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography.Text type="secondary" style={{ fontSize: 10 }}>—</Typography.Text>
        </div>
      )}
      <Typography.Text strong style={{ fontSize: 14 }}>{question.externalId}</Typography.Text>
    </div>
  );
}

function RoundQuestionItem({
  rq,
  onRemove,
}: {
  rq: RoundQuestion;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rq.id,
    data: rq,
  });
  const q = rq.question;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const imgSrc = q?.imageUrl
    ? (q.imageUrl.startsWith('http') ? q.imageUrl : `${BASE_URL}${q.imageUrl}`)
    : null;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        marginBottom: 4,
        background: isDragging ? 'rgba(24, 144, 255, 0.2)' : 'rgba(255,255,255,0.08)',
        borderRadius: 6,
      }}
    >
      <HolderOutlined style={{ cursor: 'grab', color: 'rgba(255,255,255,0.45)' }} {...listeners} {...attributes} />
      {imgSrc ? (
        <Image src={imgSrc} width={36} height={36} alt="" style={{ objectFit: 'cover', borderRadius: 4 }} draggable={false} />
      ) : (
        <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography.Text type="secondary" style={{ fontSize: 10 }}>—</Typography.Text>
        </div>
      )}
      <Typography.Text strong style={{ flex: 1, fontSize: 14 }}>{q?.externalId ?? '—'}</Typography.Text>
      <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={onRemove} />
    </div>
  );
}

export function RoundQuestionsDrawer({
  open,
  roundId,
  roundTitle,
  onClose,
}: {
  open: boolean;
  roundId: string | null;
  roundTitle: string;
  onClose: () => void;
}) {
  const { data: roundQuestions = [], isPending: loadingRQs } = useRoundQuestions(roundId, open && Boolean(roundId));
  const [poolPage, setPoolPage] = useState(1);
  const { data: questionsData, isPending: loadingPool, isError: poolError } = useQuestionsPool(open, poolPage);
  const addMutation = useRoundAddQuestion();
  const removeMutation = useRoundRemoveQuestion();
  const reorderMutation = useRoundReorderQuestions();

  const [idSearch, setIdSearch] = useState('');

  const questions = Array.isArray(questionsData?.data) ? questionsData.data : [];
  const roundQuestionIds = new Set(roundQuestions.map((rq) => rq.question?.id).filter(Boolean) as string[]);
  const availableQuestions = questions.filter((q) => !roundQuestionIds.has(q.id));

  const idFilterSet = useMemo(() => parseIdFilter(idSearch), [idSearch]);
  const filteredPool = useMemo(() => {
    if (idFilterSet.size === 0) return availableQuestions;
    return availableQuestions.filter((q) => idFilterSet.has(q.externalId));
  }, [availableQuestions, idFilterSet]);

  const sortableIds = roundQuestions.map((rq) => rq.id);
  const poolTotal = questionsData?.total ?? 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !roundId) return;

    const activeData = active.data.current;
    if (!activeData) return;

    if (activeData.type === 'pool') {
      const question = activeData.question as Question;
      const isOverRound =
        over.id === DROPPABLE_ROUND || sortableIds.includes(over.id as string);
      if (isOverRound && !roundQuestionIds.has(question.id)) {
        addMutation.mutate({ roundId, questionId: question.id });
      }
      return;
    }

    if (
      typeof active.id === 'string' &&
      typeof over.id === 'string' &&
      sortableIds.includes(active.id) &&
      sortableIds.includes(over.id) &&
      active.id !== over.id
    ) {
      const oldIndex = sortableIds.indexOf(active.id);
      const newIndex = sortableIds.indexOf(over.id);
      const reordered = [...sortableIds];
      const [removed] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, removed);
      reorderMutation.mutate({ roundId, roundQuestionIds: reordered });
    }
  };

  const { setNodeRef: setRoundRef, isOver: isOverRound } = useDroppable({ id: DROPPABLE_ROUND });
  const { setNodeRef: setPoolRef, isOver: isOverPool } = useDroppable({ id: DROPPABLE_POOL });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  return (
    <Drawer
      title={`Round: ${roundTitle}`}
      open={open}
      onClose={onClose}
      size={560}
      destroyOnHidden
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 120px)' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Flex vertical gap={8} style={{ marginBottom: 8 }}>
              <Typography.Text strong>Questions pool</Typography.Text>
              <Input
                placeholder="Filter by ID (e.g. 1, 2, 3 or 1 2 3)"
                prefix={<SearchOutlined />}
                value={idSearch}
                onChange={(e) => setIdSearch(e.target.value)}
                allowClear
              />
            </Flex>
            <div
              ref={setPoolRef}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: 12,
                borderRadius: 8,
                minHeight: 200,
                background: isOverPool ? 'rgba(24, 144, 255, 0.08)' : 'rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {loadingPool ? (
                <Spin style={{ display: 'block', margin: '48px auto' }} />
              ) : poolError ? (
                <Empty description="Failed to load questions" style={{ marginTop: 24 }} />
              ) : filteredPool.length === 0 ? (
                <Empty
                  description={
                    availableQuestions.length === 0
                      ? questions.length === 0
                        ? 'No questions. Add some from the Questions page.'
                        : 'All questions added to this round'
                      : idFilterSet.size > 0
                        ? 'No questions match the filter'
                        : 'All questions added to this round'
                  }
                  style={{ marginTop: 24 }}
                />
              ) : (
                <>
                  <div style={{ flex: 1, overflow: 'auto' }}>
                    {filteredPool.map((q) => (
                      <PoolItem
                        key={q.id}
                        question={q}
                        roundQuestionIds={roundQuestionIds}
                        onAdd={() => addMutation.mutate({ roundId: roundId!, questionId: q.id })}
                      />
                    ))}
                  </div>
                  {idFilterSet.size === 0 && poolTotal > POOL_PAGE_SIZE && (
                    <Pagination
                      size="small"
                      current={poolPage}
                      total={poolTotal}
                      pageSize={POOL_PAGE_SIZE}
                      showSizeChanger={false}
                      showTotal={(t) => `${t} total`}
                      onChange={setPoolPage}
                      style={{ marginTop: 8, flexShrink: 0 }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              In round
            </Typography.Text>
            <div
              ref={setRoundRef}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: 12,
                borderRadius: 8,
                minHeight: 200,
                background: isOverRound ? 'rgba(24, 144, 255, 0.08)' : 'rgba(0,0,0,0.2)',
              }}
            >
              {loadingRQs ? (
                <Spin style={{ display: 'block', margin: '48px auto' }} />
              ) : (
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                  {roundQuestions.map((rq) => (
                    <RoundQuestionItem
                      key={rq.id}
                      rq={rq}
                      onRemove={() =>
                        removeMutation.mutate({ roundId: roundId!, roundQuestionId: rq.id })
                      }
                    />
                  ))}
                  {roundQuestions.length === 0 && (
                    <Empty description="Drag questions here" style={{ marginTop: 24 }} />
                  )}
                </SortableContext>
              )}
            </div>
          </div>
        </div>
      </DndContext>
    </Drawer>
  );
}
