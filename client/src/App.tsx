import { useEffect, useState } from "react";
import axios from "axios";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvided,
  DroppableProvided,
} from "@hello-pangea/dnd";

interface Course {
  _id?: string;
  title: string;
  url: string;
  categories: string[];
  scrapedCategory: string;
  completionTime: string;
  notes: string;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const App = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Course[]>>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    console.log("Updted categories in state:", categories);
  }, [categories]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/courses`);
      const data = res.data;

      const categoryMap: Record<string, Course[]> = {};
      data.forEach((course: Course) => {
        const cats = course.categories?.length
          ? course.categories
          : ["Uncategorized"];
        cats.forEach((cat) => {
          if (!categoryMap[cat]) categoryMap[cat] = [];
          categoryMap[cat].push(course);
        });
      });

      //Sort each category by completion time (ascending)
      Object.keys(categoryMap).forEach((cat) => {
        categoryMap[cat].sort((a, b) => {
          const parseTime = (time: string): number => {
            const hourMatch = time.match(/(\d+(?:\.\d+)?)\s*hour/);
            const minMatch = time.match(/(\d+(?:\.\d+)?)\s*minute/);
            const hours = hourMatch ? parseFloat(hourMatch[1]) : 0;
            const minutes = minMatch ? parseFloat(minMatch[1]) : 0;
            return hours * 60 + minutes;
          };
          return parseTime(a.completionTime) - parseTime(b.completionTime);
        });
      });

      setCourses(data);
      console.log(data);

      setGrouped(categoryMap);
      setCategories(
        Object.keys(categoryMap).filter((cat) => categoryMap[cat].length > 0)
      );
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const handleAddCategory = () => {
    const newCategory = prompt("Enter new category name:");
    if (!newCategory || categories.includes(newCategory)) return;

    setCategories((prev) => [...prev, newCategory]);
  };

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const course = grouped[source.droppableId]?.find(
      (c) => c.url === draggableId
    );
    if (!course) return;

    const updatedCourse = { ...course };

    //Remove course from the source category
    updatedCourse.categories = updatedCourse.categories.filter(
      (cat) => cat !== source.droppableId
    );

    //Add destination category (only if not already in array)
    if (!updatedCourse.categories.includes(destination.droppableId)) {
      updatedCourse.categories.push(destination.droppableId);
    }

    //Update course list and regroup
    const newCourses = courses.map((c) =>
      c.url === updatedCourse.url ? updatedCourse : c
    );
    setCourses(newCourses);

    const newGrouped: Record<string, Course[]> = {};
    const allCategories = Array.from(
      new Set(newCourses.flatMap((c) => c.categories || []))
    );

    allCategories.forEach((cat) => {
      newGrouped[cat] = newCourses.filter((c) => c.categories.includes(cat));
    });
    setGrouped(newGrouped);
    setCategories(allCategories.filter((cat) => newGrouped[cat].length > 0));
  };

  const handleNoteChange = (url: string, text: string) => {
    const updated = courses.map((c) =>
      c.url === url ? { ...c, notes: text } : c
    );
    setCourses(updated);
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/api/courses/save`, {
        updatedCourses: courses,
      });
      alert("Changes saved to database.");
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save changes.");
    }
  };

  return (
    <div className="App p-4">
      <div className="flex place-content-between md:flex-row flex-col">
        <h1 className="text-xl font-bold mb-4">Udemy Course Tracker</h1>
        <div className="flex flex-col gap-2 md:flex-row items-center mb-4 md:w-1/2 w-full md:mr-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded w-3/4"
          />
          <button
            onClick={handleAddCategory}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700 flex-1"
          >
            +Add Category
          </button>
        </div>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mb-4 flex items-center"
          onClick={handleSave}
        >
          <div className="save-icon mr-1"></div>
          {/* 💾 */}
          Save Changes to DB
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-wrap gap-6">
          {categories.map((category) => (
            <Droppable droppableId={category} key={category}>
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white border border-gray-300 shadow-md rounded-lg w-72 p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-md font-semibold">{category}</h3>
                  </div>

                  {grouped[category]
                    ?.filter((course) =>
                      course.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((course, idx) => (
                      <Draggable
                        draggableId={course.url}
                        index={idx}
                        key={course.url}
                      >
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-50 border border-gray-300 rounded-md p-2 mb-3"
                          >
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 font-medium hover:underline"
                            >
                              {course.title}
                            </a>
                            <p className="text-sm text-gray-600 mb-1">
                              {course.completionTime}
                            </p>
                            <textarea
                              value={course.notes || ""}
                              onChange={(e) =>
                                handleNoteChange(course.url, e.target.value)
                              }
                              placeholder="Add notes..."
                              className="w-full text-sm border rounded p-1"
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default App;
