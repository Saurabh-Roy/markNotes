const ImageGrid = () => {


    const grid = [];
    for (let row = 0; row < 10; row++) {
      const rowElements = [];
      for (let col = 0; col < 10; col++) {
        rowElements.push(
          <div key={col} className="grid-item">
            <minidenticon-svg username="laurent"></minidenticon-svg>
          </div>
        );
      }
      grid.push(
        <div key={row} className="grid-row">
          {rowElements}
        </div>
      );
    }
    
    return (
        <div className="grid-container">
        {grid}
      </div>
    );
  }


export default ImageGrid;