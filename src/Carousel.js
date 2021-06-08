import React, { useLayoutEffect, useRef, useState, useContext } from 'react';

const Carousel = (props) => {
  const scrollContainer = useRef();
  const [leftButton, setLeftButton] = useState(false);
  const [rightButton, setRightButton] = useState(true);

  const handleClick = (action) => {
    if (!action || action.type !== 'postback') return;
    const { onButtonClick } = props;
    if (!onButtonClick) return;
    onButtonClick(action.title, action.payload);
  };

  const handleScroll = () => {
    const current = scrollContainer.current;
    if (current.scrollLeft > 0) {
      setLeftButton(true);
    } else {
      setLeftButton(false);
    }
    if (current.clientWidth === current.scrollWidth - current.scrollLeft) {
      setRightButton(false);
    } else {
      setRightButton(true);
    }
  };

  useLayoutEffect(() => {
    const checkButtons = () => {
      if (scrollContainer.current.clientWidth === scrollContainer.current.scrollWidth) {
        setLeftButton(false);
        setRightButton(false);
      } else {
        handleScroll();
      }
    };
    window.addEventListener("resize", checkButtons);
    checkButtons();
  }, [scrollContainer, setRightButton, setLeftButton, handleScroll]);

  const handleLeftArrow = () => {
    scrollContainer.current.scrollTo({
      left: scrollContainer.current.scrollLeft - 230,
      behavior: 'smooth'
    });
  };

  const handleRightArrow = () => {
    scrollContainer.current.scrollTo({
      left: scrollContainer.current.scrollLeft + 230,
      behavior: 'smooth'
    });
  };

  const { linkTarget, carousel, onButtonClick } = props;

  return (
    <React.Fragment>
      <li className="carousel">
        <div className="carousel-container" ref={scrollContainer} onScroll={() => handleScroll()}>
          {carousel.elements.map((carouselCard, index) => {
            const defaultActionUrl =
              carouselCard.default_action && carouselCard.default_action.type === 'web_url'
                ? carouselCard.default_action.url
                : null;
            return (
              <div className="carousel-card" key={index}>
                <a
                  href={defaultActionUrl}
                  target={linkTarget || '_blank'}
                  rel="noopener noreferrer"
                  onClick={() => handleClick(carouselCard.default_action)}
                >
                  {carouselCard.image_url ? (
                    <img
                      className="carousel-card-image"
                      src={carouselCard.image_url}
                      alt={`${carouselCard.title} ${carouselCard.subtitle}`}
                    />
                  ) : (
                    <div className="carousel-card-image" />
                  )}
                </a>
                <a
                  className="carousel-card-title"
                  href={defaultActionUrl}
                  target={linkTarget || '_blank'}
                  rel="noopener noreferrer"
                  onClick={() => handleClick(carouselCard.default_action)}
                >
                  {carouselCard.title}
                </a>
                <a
                  className="carousel-card-subtitle"
                  href={defaultActionUrl}
                  target={linkTarget || '_blank'}
                  rel="noopener noreferrer"
                  onClick={() => handleClick(carouselCard.default_action)}
                >
                  {carouselCard.subtitle}
                </a>
                <div className="carousel-buttons-container">
                  {carouselCard.buttons.map((button, buttonIndex) => {
                    if (button.type === 'web_url') {
                      return (
                        <a
                          key={buttonIndex}
                          href={button.url}
                          target={linkTarget || '_blank'}
                          rel="noopener noreferrer"
                          className="reply"
                        >
                          <span>{button.title}</span>
                        </a>
                      );
                    }
                    return (
                      <div
                        key={buttonIndex}
                        className="reply"
                        onClick={() => handleClick(button)}
                        role="button"
                        tabIndex={0}
                        disabled={((button.type === 'postback') && (!onButtonClick))}
                      >
                        <span>{button.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="carousel-arrows-container">
          {leftButton && (
            <div
              className="left-arrow carousel-arrow"
              onClick={handleLeftArrow}
              role="button"
              tabIndex={0}
            >
              <div className="arrow" alt="left carousel arrow" >←</div>
            </div>
          )}
          {rightButton && (
            <div
              className="right-arrow carousel-arrow"
              onClick={handleRightArrow}
              role="button"
              tabIndex={0}
            >
              <div className="arrow" alt="right carousel arrow">→</div>
            </div>
          )}
        </div>
      </li>

    </React.Fragment>
  );
};

export default Carousel;