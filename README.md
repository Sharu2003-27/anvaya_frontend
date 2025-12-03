# Anvaya CRM

A lead management CRM designed for sales teams to efficiently manage leads, sales agents, comments, and reports.
Built with React (UI), Node.js + Express (API), and MongoDB (Database).

---

## Demo Link

[Live Demo](https://anvaya-frontend-rust.vercel.app/)  

---

## Quick Start

```
git clone https://github.com/Sharu2003-27/anvaya_frontend.git
cd <anvaya_frontend>
npm install
npm run dev  
```

## Technologies
- React JS
- React Router
- Node.js
- Express.js
- CORS
- MongoDB
- CSS

## Demo Video
Watch a walkthrough (7 minutes) of all major features of this app:
[Loom Video Link](https://drive.google.com/file/d/1BbbVysI9Sz4TyX1Eb8PNfwYG6oLYA5Wt/view?usp=sharing)

## Features

**Dashboard**
- Sidebar menu (Leads, Sales, Agents, Reports, Settings)
- Lead cards grouped by status (New, Contacted, Qualified...)
- Quick filters
- Add New Lead button

**Lead Management**
- View full details of a lead
- Edit lead details
- Comments section with author + timestamp
- Add/Submit new comments

**Lead List**
- Table of all leads with status + assigned agent
- Filters (Status, Sales Agent)
- Sorting (Priority, Time to Close)
- Add New Lead button

**Add New Lead**
- Form inputs: name, source, sales agent, status, priority, time to close, tags
- Create Lead button

**Sales Agent Management**
- List of all agents (name + email)
- Add New Agent 

**Add New Agent**
- Form: name, email
- Create Agent button

**Reports**
- Leads closed vs pipeline (Pie Chart)
- Leads closed by agent (Bar Chart)
- Lead status distribution (Bar/Pie Chart)

**Lead Status View**
- View all leads within a specific status
- Filters (Agent, Priority)
- Sort (Time to Close)

**Sales Agent View**
- View all leads assigned to a particular agent
- Filters + sorting

## API Reference

### **GET /agents**
Fetch all sales agents.<br>	 
Sample Response:<br>
```[{ _id, name, email, createdAt }, …]```

### **GET /leads/:id**	
Get single lead.<br>		
Sample Response:<br>
```{ _id, name, source, status, tags, priority, timeToClose, createdAt }```

### **GET /leads/:id/comments**
Fetch all comments for a lead. <br>
Sample Response: <br>
```[{ id, commentText, author, createdAt }]```

### **POST	/tags**	
Create new tag.<br>	
Sample Response:<br>
```{ name }```

### **POST /leads/:id/comments**<br>  	
Add new comment.<br> 	 
Sample Response:<br> 
```{ commentText, author  }```

### **PUT /leads/:id**<br>
Update lead.<br>
Sample Response:<br>
```{ name, source, salesAgent, status, tags, timeToClose, priority }```


## Contact
For bugs or feature requests, please reach out to sharayu.borude27@gmail.com