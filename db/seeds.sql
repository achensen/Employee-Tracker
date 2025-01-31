INSERT INTO department (name)
VALUES ('Accounting'),
       ('Outbound'),
       ('Inbound');

INSERT INTO role (title, salary, department_id)
VALUES ('Accounting Manager', 80000, 1),
    ('Accountant', 50000, 1),
    ('Outbound Manager', 90000, 2),
    ('Outbound Associate', 60000, 2),
    ('Inbound Manager', 90000, 3),
    ('Inbound Associate', 60000, 3);

INSERT INTO employee (first_name, last_name, role_id,manager_id)
VALUES ('Bob','Belcher',1,null),
    ('Linda','Belcher',2,1),
    ('Tina','Belcher',3,null),
    ('Louise','Belcher',4,3),
    ('Gene','Belcher',5,null),
    ('Felix','Fischoder',6,5);
    
    

      
       
