FROM python:3

ADD index.py /
RUN apt-get update -y
RUN apt-get install -y unzip xvfb libxi6 libgconf-2-4
# We need wget to set up the PPA and xvfb to have a virtual screen and unzip to install the Chromedriver
RUN pip install  selenium-wire
RUN pip install  chromedriver-py==91.0.4472.19
RUN pip install  gql
RUN pip install  selenium
RUN pip install  numpy
RUN pip install  python-dotenv
RUN pip install  psutil

# Set up the Chrome PPA
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list


# Update the package list and install chrome
RUN apt-get update -y
RUN apt-get install -y google-chrome-stable
RUN apt-get install -y default-jdk

RUN curl https://intoli.com/install-google-chrome.sh | bash
RUN ln -s /usr/lib/x86_64-linux-gnu/libnss3.so /usr/lib/libnss3.so

RUN wget -q "http://chromedriver.storage.googleapis.com/91.0.4472.19/chromedriver_linux64.zip" -O /tmp/chromedriver.zip \
    && unzip /tmp/chromedriver.zip -d /usr/bin/ \
    && rm /tmp/chromedriver.zip
WORKDIR /usr/src/app
ENV start_lat = 10.773
ENV end_lat=10.770
ENV long=106.6481
COPY . .
CMD echo run now
CMD [ "python3", "/usr/src/app/index.py" ]