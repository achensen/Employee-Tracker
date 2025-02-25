// import { QueryResult } from 'pg';
import { pool, connectToDb } from "./connection.js";
import inquirer from "inquirer";
await connectToDb();

const init = () => {
  //Add other choices from acceptance criteria

  inquirer
    .prompt([
      {
        type: "list",
        message: "Select an Option",
        name: "menu",
        choices: [
          "View Departments",
          "View Roles",
          "View Employees",
          "Add Department",
          "Add Role",
          "Add Employee",
          "Update Employee Role",
          "Delete Employee",
          "Exit",
        ],
      },
    ])
    .then((response) => {
      switch (response.menu) {
        case "View Departments":
          getAllDepartments();
          break;
        case "View Roles":
          getRoleData();
          break;
        case "View Employees":
          getEmployeesData();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRole();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "Delete Employee":
          deleteEmployee();
          break;
        case "Exit":
          process.exit();
        default:
          console.log("Invalid Entry");
          break;
      }
    });
};
const getAllDepartments = () => {
  pool.query("SELECT * FROM department").then(({ rows }) => {
    console.table(rows);
    init();
  });
};
const getRoleData = () => {
  pool.query("SELECT * FROM role").then(({ rows }) => {
    console.table(rows);
    init();
  });
};
//Self-Join on Employee Table, e2 second employee table
const getEmployeesData = () => {
  pool
    .query(
      "SELECT employee.first_name,employee.last_name, role.title, role.salary, department.name, CONCAT(e2.first_name,' ',e2.last_name) as manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee e2 on employee.manager_id = e2.id"
    )
    .then(({ rows }) => {
      console.table(rows);
      init();
    });
};
const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "newDepartment",
        message: "What is the name of the department you want to add?",
      },
    ])
    .then((answers) => {
      pool
        .query("INSERT INTO department (name) VALUES ($1)", [
          answers.newDepartment,
        ])
        .then(() => init());
    });
};

const addRole = () => {
  pool
    .query("SELECT * FROM department")
    .then(({ rows }) => {
      const departmentArray = rows.map((department) => ({
        name: department.name,
        value: department.id,
      }));

      return inquirer.prompt([
        {
          type: "input",
          name: "roleName",
          message: "What is the name of the role you want to add?",
        },
        {
          type: "input",
          name: "roleSalary",
          message: "What is the salary for this role?",
          validate: (input) =>
            !isNaN(Number(input)) || "Please enter a valid number",
        },
        {
          type: "list",
          name: "selectDepartment",
          message: "Select a department for the new role:",
          choices: departmentArray,
        },
      ]);
    })
    .then((answers) => {
      // Insert the new role into the 'role' table
      pool
        .query(
          "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
          [answers.roleName, answers.roleSalary, answers.selectDepartment]
        )
        .then(() => init());
    });
};

const addEmployee = async () => {
  // role list from database
  const rolesList = await pool.query("SELECT id, title FROM role");
  const roles = rolesList.rows.map((role) => ({
    name: role.title,
    value: role.id,
  }));

  // access to employee to select manager
  const employeesResult = await pool.query(
    "SELECT id, first_name, last_name FROM employee"
  );
  const managers = employeesResult.rows.map((emp) => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));
  // Prompt user for employee details, then for choices based on role and manager
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "Enter the employee's first name:",
      validate: (input) => (input ? true : "First name cannot be empty"),
    },
    {
      type: "input",
      name: "lastName",
      message: "Enter the employee's last name:",
      validate: (input) => (input ? true : "Last name cannot be empty"),
    },
    {
      type: "list",
      name: "roleId",
      message: "Select the employee's role:",
      choices: roles,
    },
    {
      type: "list",
      name: "managerId",
      message: "Select the employee's manager:",
      choices: managers,
    },
  ]);

  // add the new employee into the database
  await pool.query(
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
    [answers.firstName, answers.lastName, answers.roleId, answers.managerId]
  );

  console.log("Employee added successfully!");
  init();
};

const updateEmployeeRole = () => {
  pool.query("SELECT * FROM employee").then(({ rows }) => {
    const employeeArray = rows.map((employee) => ({
      name: employee.first_name + " " + employee.last_name,
      value: employee.id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          message: "Select an employee to update",
          name: "selectEmployee",
          choices: employeeArray,
        },
        {
          type: "input",
          message: "What is the new role id?",
          name: "roleId",
        },
      ])
      .then((answers) => {
        pool
          .query("UPDATE employee SET role_id= $1 WHERE id= $2", [
            answers.roleId,
            answers.selectEmployee,
          ])
          .then(() => init());
      });
  });
};
//Bonus : future issue, need to be able to delete the department and how is relates to the roles 
// const deleteDepartment = () => {
//   pool.query("SELECT * FROM department").then(({ rows }) => {
//     const departmentArray = rows.map((department) => ({
//       name: department.name,
//       value: department.id,
//     }));
//     inquirer
//       .prompt([
//         {
//           type: "list",
//           message: "Select a department to delete",
//           name: "selectDepartment",
//           choices: departmentArray,
//         },
//       ])
//       .then((answers) => {
//         pool
//           .query("DELETE FROM department WHERE id=$1", [
//             answers.selectDepartment,
//           ])
//           .then(() => init());
//       });
//   });
// };

//Bonus
const deleteEmployee = () => {
  pool.query("SELECT id, first_name, last_name FROM employee")
    .then(({ rows }) => {
      const employeesList = rows.map((employee) => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id,
      }));
      inquirer
        .prompt([
          {
            type: "list",
            message: "Select an employee to delete",
            name: "selectedEmployeeId",
            choices: employeesList,
          },
        ])
        .then((answers) => {
          const { selectedEmployeeId } = answers;
          pool
            .query("DELETE FROM employee WHERE id = $1", [selectedEmployeeId])
            .then(() => {
              console.log("Employee deleted successfully.");
              init(); 
            });
        });
    });
};

init();
