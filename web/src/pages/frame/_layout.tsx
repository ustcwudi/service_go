import React from 'react';
import { ConfigProvider } from 'antd';
import Particles from 'react-particles-js';
import styles from './_layout.less';
import { ReactComponent as Logo } from '../../img/logo.svg';
import zhCN from 'antd/lib/locale/zh_CN';

export default (props: any) => {
  return (
    <ConfigProvider locale={zhCN}>
      <Particles
        className={styles.background}
        params={{
          particles: {
            number: {
              value: 50,
            },
            size: {
              value: 3,
            },
          },
          interactivity: {
            events: {
              onhover: {
                enable: true,
                mode: 'repulse',
              },
            },
          },
        }}
      />
      <div className={styles.box}>
        <Logo className={styles.logo} width={50} height={50} />
        <div className={styles.title}>管理终端</div>
        {props.children}
      </div>
    </ConfigProvider>
  );
};
