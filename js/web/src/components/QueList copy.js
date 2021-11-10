import React, {useEffect, useState} from "react"
import {TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper} from '@material-ui/core'
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd"


// fake data generator
const getItems = count =>
  Array.from({length: count}, (v, k) => k).map(k => ({
    id: `item-${k}`,
    primary: `item ${k}`,
    secondary: k % 2 === 0 ? `Whatever for ${k}` : undefined
  }))

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const getItemStyle = (isDragging, draggableStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle,

  ...(isDragging && {
    background: "rgb(235,235,235)"
  })
})

const QueList = () => {

  const [items, setItems] = useState([])

  useEffect(() => {
   setItems(getItems(20)) 
  },[])

 const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    console.log(`dragEnd ${result.source.index} to  ${result.destination.index}`)
    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    )

    setItems(reorderedItems)
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nr</TableCell>
            <TableCell>Label</TableCell>
            <TableCell align="right">Text</TableCell>
          </TableRow>
        </TableHead>
        <TableBody component={DroppableComponent(onDragEnd)}>
          {items.map((item, index) => (
            <TableRow component={DraggableComponent(item.id, index)} key={item.id} >
              <TableCell scope="row">{index + 1}</TableCell>
              <TableCell>{item.primary}</TableCell>
              <TableCell align="right">{item.secondary}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const DraggableComponent = (id, index) => (props) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <TableRow
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}

          {...props}
        >
          {props.children}
        </TableRow>
      )}
    </Draggable>
  )
}

const DroppableComponent = (
  onDragEnd: (result, provided) => void) => (props) => {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'1'} direction="vertical">
          {(provided) => {
            return (
              <TableBody ref={provided.innerRef} {...provided.droppableProps} {...props}>
                {props.children}
                {provided.placeholder}
              </TableBody>
            )
          }}
        </Droppable>
      </DragDropContext>
    )
  }


  export default QueList;
