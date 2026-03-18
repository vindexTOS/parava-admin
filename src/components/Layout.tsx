import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Typography, Flex } from 'antd';
import {
  LogoutOutlined,
  UnorderedListOutlined,
  CloudSyncOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useAuth } from '../hooks';

const { Sider, Content } = AntLayout;

const menuItems = [
  { key: '/', icon: <UnorderedListOutlined />, label: 'Questions' },
  { key: '/roadmap', icon: <ProjectOutlined />, label: 'Roadmap' },
  { key: '/characters', icon: <SmileOutlined />, label: 'Characters' },
  { key: '/scraper', icon: <CloudSyncOutlined />, label: 'Scraper' },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuth().logout;
  const [collapsed, setCollapsed] = useState(false);
  const selected = location.pathname.startsWith('/roadmap')
    ? '/roadmap'
    : location.pathname.startsWith('/characters')
      ? '/characters'
      : location.pathname.startsWith('/scraper')
        ? '/scraper'
        : '/';

  return (
    <AntLayout hasSider>
      <Sider trigger={null} collapsible collapsed={collapsed} width={220}>
        <Flex vertical style={{ height: '100%' }}>
          <Flex align="center" justify={collapsed ? 'center' : 'flex-start'} style={{ height: 64, padding: 16 }}>
            {!collapsed && (
              <Typography.Title level={5} style={{ margin: 0, color: 'rgba(255,255,255,0.85)' }}>
                Prava Admin
              </Typography.Title>
            )}
          </Flex>
          <Flex flex={1} vertical style={{ overflow: 'auto' }}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selected]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
            />
          </Flex>
          <Flex vertical gap="small" style={{ padding: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: 'rgba(255,255,255,0.65)' }}
            />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              block
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {!collapsed && 'Logout'}
            </Button>
          </Flex>
        </Flex>
      </Sider>
      <AntLayout>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
