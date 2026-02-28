import { Link } from 'react-router-dom';
import { Button, Card, Space, Typography, Tag, Breadcrumb } from 'antd';
import { PlayCircleOutlined, StopOutlined, HomeOutlined } from '@ant-design/icons';
import { useScraperStatus, useScraperStart, useScraperStop } from '../hooks';

export function ScraperPage() {
  const { data: status } = useScraperStatus();
  const startMutation = useScraperStart();
  const stopMutation = useScraperStop();
  const isRunning = status?.isRunning ?? false;

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Breadcrumb
        items={[
          { title: <Link to="/"><HomeOutlined /> Home</Link> },
          { title: 'Scraper' },
        ]}
      />
      <Card title="Scraper">
        <Space direction="vertical" size="large">
          <Space align="center">
            <Typography.Text>Status:</Typography.Text>
            <Tag color={isRunning ? 'orange' : 'green'}>{isRunning ? 'Running' : 'Idle'}</Tag>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => startMutation.mutate()}
              loading={startMutation.isPending}
              disabled={isRunning}
            >
              Start scraping
            </Button>
            <Button
              danger
              icon={<StopOutlined />}
              onClick={() => stopMutation.mutate()}
              loading={stopMutation.isPending}
              disabled={!isRunning}
            >
              Stop
            </Button>
          </Space>
          {startMutation.data?.data != null && (
            <Typography.Text type="secondary">
              Last run: inserted {startMutation.data.data.inserted}, updated {startMutation.data.data.updated}
            </Typography.Text>
          )}
        </Space>
      </Card>
    </Space>
  );
}
