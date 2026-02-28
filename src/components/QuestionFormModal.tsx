import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Form, Modal, Input, InputNumber, Space, Checkbox, Button, Card, Spin } from 'antd';
import type { LocalizedText, CreateQuestionBody } from '../api';
import type { Question } from '../api';
import { useQuestionOne, useQuestionCreate, useQuestionUpdate } from '../hooks';

const LANG_KEYS = ['en', 'ru', 'ka'] as const;

function LocalizedFields({ namePrefix }: { namePrefix: (string | number)[] }) {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {LANG_KEYS.map((lang) => (
        <Form.Item
          key={lang}
          name={[...namePrefix, lang]}
          label={lang.toUpperCase()}
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
      ))}
    </Space>
  );
}

function parseCategories(v: unknown): number[] {
  if (Array.isArray(v)) return v.map(Number).filter((n) => !Number.isNaN(n));
  if (typeof v === 'string') return v.split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
  return [];
}

function normalizeAnswer(a: unknown) {
  const o = (a ?? {}) as Record<string, unknown>;
  const text = (o.text ?? o.Text) as LocalizedText | undefined;
  const isCorrect = o.isCorrect ?? o.is_correct;
  return {
    text: text && typeof text === 'object' ? { en: String(text.en ?? ''), ru: String(text.ru ?? ''), ka: String(text.ka ?? '') } : { en: '', ru: '', ka: '' },
    isCorrect: Boolean(isCorrect),
  };
}

function questionToInitialValues(question: Question) {
  const answers = question.answers ?? [];
  return {
    externalId: question.externalId,
    questionText: question.questionText,
    questionExplained: question.questionExplained ?? undefined,
    correctAnswer: question.correctAnswer,
    imageUrl: question.imageUrl ?? undefined,
    subject: question.subject,
    categories: Array.isArray(question.categories) && question.categories.length ? question.categories.join(', ') : '',
    audioUrl: question.audioUrl ?? undefined,
    answers: answers.map(normalizeAnswer),
  };
}

type FormValues = ReturnType<typeof questionToInitialValues>;

const EMPTY_ANSWER = { text: { en: '', ru: '', ka: '' }, isCorrect: false };

function AnswerFields({
  answers,
  onAdd,
  onRemove,
}: {
  answers: FormValues['answers'];
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <>
      {answers.map((_, index) => (
        <Card key={index} size="small" style={{ marginBottom: 16 }}>
          <LocalizedFields namePrefix={['answers', index, 'text']} />
          <Form.Item name={['answers', index, 'isCorrect']} valuePropName="checked" label="Correct answer">
            <Checkbox />
          </Form.Item>
          <Button type="link" danger size="small" onClick={() => onRemove(index)}>
            Remove answer
          </Button>
        </Card>
      ))}
      <Button type="dashed" onClick={onAdd} block>
        + Add answer
      </Button>
    </>
  );
}

function buildPayload(raw: Record<string, unknown>): CreateQuestionBody {
  return {
    externalId: Number(raw.externalId),
    questionText: raw.questionText as LocalizedText,
    questionExplained: (raw.questionExplained as LocalizedText) || null,
    answers: (raw.answers as FormValues['answers']).map((a) => ({ text: a.text as LocalizedText, isCorrect: Boolean(a.isCorrect) })),
    correctAnswer: Number(raw.correctAnswer),
    imageUrl: (raw.imageUrl as string) || null,
    subject: Number(raw.subject),
    categories: parseCategories(raw.categories),
    audioUrl: (raw.audioUrl as string) || null,
  };
}

export type QuestionFormRef = { submit: () => void };

const QuestionFormBody = forwardRef<
  QuestionFormRef,
  {
    initialValues: FormValues | undefined;
    onSubmit: (payload: CreateQuestionBody) => void;
  }
>(function QuestionFormBody({ initialValues, onSubmit }, ref) {
  const [form] = Form.useForm();
  const submitRef = useRef(onSubmit);

  const answers = Form.useWatch('answers', form) ?? initialValues?.answers ?? [EMPTY_ANSWER];

  submitRef.current = onSubmit;
  useImperativeHandle(ref, () => ({
    submit: () => form.validateFields().then((raw) => submitRef.current(buildPayload(raw as Record<string, unknown>))),
  }));

  const handleAdd = () => {
    form.setFieldValue('answers', [...(form.getFieldValue('answers') ?? []), { ...EMPTY_ANSWER }]);
  };

  const handleRemove = (index: number) => {
    const current = form.getFieldValue('answers') ?? [];
    form.setFieldValue(
      'answers',
      current.filter((_: unknown, i: number) => i !== index)
    );
  };

  return (
    <Form form={form} layout="vertical" preserve={false} initialValues={initialValues} onFinish={(raw) => submitRef.current(buildPayload(raw as Record<string, unknown>))}>
      <Form.Item name="externalId" label="External ID" rules={[{ required: true }]}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="questionText" label="Question text" rules={[{ required: true }]}>
        <LocalizedFields namePrefix={['questionText']} />
      </Form.Item>
      <Form.Item name="questionExplained" label="Question explained (optional)">
        <LocalizedFields namePrefix={['questionExplained']} />
      </Form.Item>
      <Form.Item name="correctAnswer" label="Correct answer index" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="imageUrl" label="Image URL">
        <Input />
      </Form.Item>
      <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="categories" label="Categories" rules={[{ required: true }]}>
        <Input placeholder="e.g. 1, 2, 3" />
      </Form.Item>
      <Form.Item name="audioUrl" label="Audio URL">
        <Input />
      </Form.Item>
      <Form.Item name="answers" label="Answers" rules={[{ required: true, type: 'array', min: 1 }]}>
        <AnswerFields answers={answers} onAdd={handleAdd} onRemove={handleRemove} />
1      </Form.Item>
    </Form>
  );
});

export function QuestionFormModal({
  open,
  questionId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  questionId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const formRef = useRef<QuestionFormRef>(null);
  const { data: question } = useQuestionOne(questionId, open);
  const createMutation = useQuestionCreate(onSuccess);
  const updateMutation = useQuestionUpdate(questionId, onSuccess);

  const isEdit = Boolean(questionId);
  const submitting = createMutation.isPending || updateMutation.isPending;
  const canShowForm = !isEdit || question;
  const initialValues = question ? questionToInitialValues(question) : undefined;

  const handleSubmit = (payload: CreateQuestionBody) => {
    if (questionId) {
      updateMutation.mutate({ id: questionId, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleOk = () => {
    formRef.current?.submit();
  };

  return (
    <Modal
      title={isEdit ? 'Edit question' : 'Create question'}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      width={640}
      confirmLoading={submitting}
      destroyOnClose
      okButtonProps={{ disabled: isEdit && !question }}
    >
      {!canShowForm ? (
        <Spin style={{ display: 'block', margin: '48px auto' }} />
      ) : (
        <QuestionFormBody
          ref={formRef}
          key={isEdit ? `edit-${questionId}` : 'create'}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  );
}
