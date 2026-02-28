import { Layout, Row, Col, Card, Form, Input, Button } from 'antd';
import { useLogin } from '../hooks';

const { Content } = Layout;

export function LoginPage() {
  const [form] = Form.useForm();
  const loginMutation = useLogin();

  return (
    <Layout>
      <Content>
        <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
          <Col xs={24} sm={24} md={12} lg={8} xl={6}>
            <Card title="Admin login">
              <Form
                form={form}
                layout="vertical"
                onFinish={(values) => loginMutation.mutate(values)}
                requiredMark={false}
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Invalid email' },
                  ]}
                >
                  <Input type="email" placeholder="admin@example.com" size="large" autoComplete="email" />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Password is required' },
                    { min: 6, message: 'At least 6 characters' },
                  ]}
                >
                  <Input.Password placeholder="••••••••" size="large" autoComplete="current-password" />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loginMutation.isPending}
                  >
                    Sign in
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
