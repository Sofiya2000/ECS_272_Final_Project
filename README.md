ECS 272 Final Project
Jordan Penner and Sofiya Shaikh

The data file (`src/Data/data.json`) that we use requires Git Large File Service to retrieve from our repository.
It often comes with an installation of git, but can be installed via apt or homebrew:
`apt install git-lfs`

After cloning the repository, you will need to pull the large file:
`git lfs pull`

If all else fails, you can download the csv datafile from [Kaggle](https://www.kaggle.com/datasets/START-UMD/gtd/) and put it in `src/Data/globalterrorismdb_0718dist.csv`, then run the python script there:
`python3 preprocess.py`
which should generate `data.json` in the same format in the right location.

To build and start the application (assuming you have NPM installed), just run
`npm start`
and the app should start running on localhost:3000. Feel free to reach out to either of us to troubleshoot/ask questions!
