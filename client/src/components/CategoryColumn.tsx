import React from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import CourseCard from "./CourseCard";

export interface Course {
  id: string;
  name: string;
  url: string;
  time: string;
}

interface Props {
  category: string;
  courses: Course[];
}

const CategoryColumn: React.FC<Props> = ({ category, courses }) => (
  <Droppable droppableId={category}>
    {(provided) => (
      <div
        className="column"
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        <h2>{category}</h2>
        {courses.map((course, idx) => (
          <Draggable key={course.id} draggableId={course.id} index={idx}>
            {(prov) => (
              <div
                ref={prov.innerRef}
                {...prov.draggableProps}
                {...prov.dragHandleProps}
              >
                <CourseCard course={course} />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
);

export default CategoryColumn;
