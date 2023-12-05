import React, { useState } from 'react';
import { useTransition, useSpring, animated } from 'react-spring';
import { styled, createGlobalStyle } from 'styled-components';
import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';
import Page4 from './Page4';

const colors = {
    primary: '#3498db',
    secondary: 'teal',
    text: '#333',
    background: '#ecf0f1',
  };

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${colors.background};
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
  }
`;

const Container = styled.div`
  background-color: ${colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TabsAndButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80%;
`;

const Tab = styled.div`
  background-color: ${props => (props.active ? colors.secondary : colors.background)};
  color: ${props => (props.active ? '#fff' : colors.text)};
  padding: 10px;
  margin-right: 10px;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background-color: ${colors.secondary};
    color: #fff;
  }
`;

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  background-color: #fff;
  border: 1px solid ${colors.background};
`;

const StyledButton = styled.button`
  padding: 10px;
  cursor: pointer;
  background-color: ${colors.primary};
  color: #fff;
  border: none;
  border-radius: 5px;
  outline: none;
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const pageTitles = [
  "Introduction",
  "Terrorist Groups",
  "Activity in the U.S.",
  "Casualties by World Region",
  "Interactive Globe",
];

const IntroContainer = styled.div`
  text-align: center;
  background: ${colors.background};
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  margin-top: 100px;

  h1 {
    margin: 20px 0;
    font-size: 3em;
  }
  h2 {
    margin: 20px 0;
    font-size: 2em;
  }
  p {
    margin: 20px 0;
    font-size: 1.5em;
  }
  `;

const Intro = () => {
    const delaySpacing = 2000;
    const fadeIn1 = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: { duration: 1000 },
      });
    
      const fadeIn2 = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: { duration: 1000 },
        delay: delaySpacing,
      });
    
      const fadeIn3 = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: { duration: 1000 },
        delay: 2 * delaySpacing,
      });
    
      const fadeIn4 = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: { duration: 1000 },
        delay: 3 * delaySpacing,
      });
    
      const fadeIn5 = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: { duration: 1000 },
        delay: 4 * delaySpacing,
      });
  
    return (
      <IntroContainer>
        <animated.h1 style={fadeIn1}>Welcome!</animated.h1>
        <animated.h2 style={fadeIn2}>This is a visual representation of the <a href="https://www.start.umd.edu/gtd/">Global Terrorism Database</a></animated.h2>
        <animated.h2 style={fadeIn3}>Dataset pulled from <a href="https://www.kaggle.com/datasets/START-UMD/gtd/">Kaggle</a></animated.h2>
        <animated.h2 style={fadeIn4}>Created by Jordan Penner and Sofiya Shaikh</animated.h2>
        <animated.p style={fadeIn5}>
            This application was created as a final project for UC Davis course ECS 272.<br/>
            Our goal is to provide insights into global terrorism trends through interactive visualizations.<br/>
            We have categorized these visualizations into tabs that you can navigate through at your own pace.<br/>
            Over 200,000 incidents are included in this dataset, resulting in nearly 900,000 casualties worldwide.<br/>
            We hope that this project gives you a better understanding of the scale of these terrorist activity over the years.
        </animated.p>
      </IntroContainer>
    );
  };

const pages = [<Intro />, <Page1 />, <Page2 />, <Page3 />, <Page4 />];

const App = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const transitions = useTransition(currentPage, {
    from: { opacity: 0, transform: 'translate3d(0, 100%, 0)' },
    enter: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    leave: { opacity: 0, transform: 'translate3d(0, -100%, 0)' },
  });

  return (
    <>
        <GlobalStyle />
        <Container>
            `<TabsAndButtonsContainer>
                <StyledButton onClick={() => changePage(currentPage-1)} disabled={currentPage === 0}>
                <strong>Previous</strong>
                </StyledButton>

                {[0, 1, 2, 3, 4].map((pageNumber) => (
                <Tab
                    key={pageNumber}
                    onClick={() => changePage(pageNumber)}
                    active={currentPage === pageNumber}
                >
                    <strong>{pageTitles[pageNumber]}</strong>
                </Tab>
                ))}

                <StyledButton onClick={() => changePage(currentPage+1)} disabled={currentPage === pages.length - 1}>
                <strong>Next</strong>
                </StyledButton>
            </TabsAndButtonsContainer>

            <PageContainer>
            {transitions((style, item) => (
                <animated.div style={{ ...style, width: '100%', position: 'absolute', background: colors.background }}>
                {pages[item]}
                </animated.div>
            ))}
            </PageContainer>
        </Container>
    </>
  );
};

export default App;
